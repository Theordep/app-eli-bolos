# Eli Bolos — Modelo de Dados (v1)

> Companheiro de [00-negocio.md](00-negocio.md). Schema relacional, agnóstico de banco/ORM — decisão
> de Postgres/SQLite/Prisma/etc. fica para a etapa de arquitetura técnica.

## Convenções

- PK sempre `id` (uuid).
- Todo valor monetário em **centavos (inteiro)** para evitar erro de ponto flutuante.
- Toda tabela tem `created_at` / `updated_at` (omitidos abaixo por brevidade).
- `enum` é ilustrativo — pode virar `CHECK` constraint, tabela de lookup, ou enum nativo do banco.

## Visão geral das áreas

```
configuracoes (versionada)    (parâmetros de precificação)
insumos ──┬── insumo_historico_precos
          └── receita_itens ── produtos ── produto_custo_snapshot (custo direto por unidade de venda, + configuracao_id)
clientes ── pedidos ──┬── pedido_itens (quantidade + tempo real digitado, aponta pra produtos + snapshot)
                       └── pedido_pagamentos
compras_insumos ─┐
pedido_pagamentos ┴── transacoes_financeiras   (ledger único p/ dashboard)
pedidos + pedido_itens ── listas_compra ── listas_compra_itens
```

> Nota: mão de obra e margem **não** ficam mais no snapshot do produto — elas dependem de quanto
> tempo aquele pedido específico levou, então são calculadas e congeladas direto em `pedido_itens`
> (ver §3 e §5.1).

---

## 1. `configuracoes` (versionada)

Em vez de uma linha única que é sobrescrita, `configuracoes` é **append-only**: toda alteração cria uma
nova linha com `vigente_desde`. A "config atual" é sempre a de `vigente_desde` mais recente. Isso
permite, por exemplo, um relatório futuro tipo "quanto eu estava mirando de salário em cada mês do
ano" sem precisar reconstruir isso de outro lugar.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `vigente_desde` | timestamp | a partir de quando esses valores valem |
| `meta_salario_mensal_centavos` | int | quanto ela quer tirar de salário por mês |
| `horas_trabalho_mes` | numeric | horas trabalhadas por mês, para achar o valor da hora |
| `taxa_perda_percentual` | numeric | padrão 10 |
| `custo_invisivel_percentual` | numeric | % sobre o custo de insumos p/ cobrir gás/luz/água (padrão 15) |
| `margem_lucro_padrao_percentual` | numeric | padrão sugerido (20–30%) |

**Resolve:** centraliza as regras da fórmula de precificação (item 2–5 do domínio 1) num lugar só, em
vez de espalhar constantes pelo código, **e** mantém rastro de como essas regras mudaram ao longo do
tempo. `produto_custo_snapshot` (§3.2) guarda uma referência a qual `configuracoes_id` foi usada em
cada cálculo — então dá pra sempre explicar "por que esse pedido de janeiro custou X" mesmo que a meta
de salário tenha mudado depois.

---

## 2. `insumos`

Ingredientes e embalagens compartilham a mesma estrutura (preço da embalagem / quantidade da
embalagem = custo unitário), então vivem na mesma tabela.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `nome` | text | "Leite condensado", "Caixa de bolo P" |
| `tipo` | enum(`ingrediente`,`embalagem`) | |
| `unidade_base` | enum(`g`,`ml`,`unidade`) | unidade em que tudo abaixo é medido |
| `embalagem_quantidade_base` | numeric | ex.: 395 (g) numa lata de leite condensado |
| `embalagem_preco_centavos` | int | preço pago pela embalagem inteira (cache do último valor) |

`custo_unitario = embalagem_preco_centavos / embalagem_quantidade_base` — calculado, não guardado.

> Nota de implementação: para o MVP, cadastrar o insumo já na mesma `unidade_base` usada nas receitas
> evita lidar com conversão kg↔g dentro do banco (isso vira só uma ajuda de UI na hora de digitar).

### 2.1 `insumo_historico_precos`

Log append-only. Alimentado tanto por edição manual quanto por `compras_insumos` (ver §7).

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `insumo_id` | FK → insumos |
| `preco_centavos` | int (preço da embalagem naquele registro) |
| `registrado_em` | timestamp |
| `origem` | enum(`compra`,`ajuste_manual`) |

**Resolve:** dá suporte ao preço estimado na lista de compras e mantém rastro de por que o custo de um
produto mudou ao longo do tempo.

---

## 3. `produtos` (Ficha Técnica — cabeçalho)

Dois jeitos de venda coexistem: bolos por **quilo** (1kg, 2kg, 5kg, 10kg...) e coisas como brigadeiro
por **unidade**. `produtos` representa o sabor/receita, e `modo_venda` decide qual é a "unidade de
venda" — 1kg, ou 1 unidade — em que a ficha técnica inteira (ingredientes, custo, preço) é expressa.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `nome` | text | "Bolo de Chocolate", "Brigadeiro Gourmet" |
| `modo_venda` | enum(`kg`,`unidade`) | define a "unidade de venda" usada em toda a ficha técnica |
| `tamanho_lote_padrao` | int, nullable | só p/ `modo_venda=unidade`: sugestão de quantas unidades tem um lote fechado (ex.: 12 brigadeiros). Puramente sugestão de preenchimento, não obrigatório |
| `tempo_preparo_estimado_minutos` | int | **sugestão inicial**, não trava nada — ver nota abaixo |
| `ativo` | bool | permite "aposentar" sabor sem apagar histórico |

> **Mão de obra não escala automaticamente com peso/quantidade.** O tempo de preparo dela varia por
> motivos que não dá pra prever com uma fórmula (mais camadas, decoração mais elaborada, etc.), e ela
> mesma não saberia estimar uma regra fixa — é trabalho de cozinha de casa, não produção em escala. Por
> isso, o tempo entra **manualmente em cada pedido** (`pedido_itens.tempo_preparo_minutos`, §5.1), só
> pré-preenchido com essa sugestão pra ela não começar do zero toda vez. Isso também significa que mão
> de obra e margem não fazem parte do "custo por kg/unidade" do produto — só o custo de ingredientes
> escala automaticamente; mão de obra é sempre um valor calculado por pedido (ver §3.2 e §5.1).

### 3.1 `receita_itens`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `produto_id` | FK → produtos | |
| `insumo_id` | FK → insumos | |
| `quantidade_utilizada` | numeric (na `unidade_base` do insumo) | quantidade para produzir **1 unidade de venda** do produto (1kg se `modo_venda=kg`, 1 unidade se `modo_venda=unidade`) |

**Resolve a Ficha Técnica:** custo direto **por unidade de venda** = `SUM(receita_itens.quantidade_utilizada *
(insumo.embalagem_preco_centavos / insumo.embalagem_quantidade_base))` para todos os itens (ingrediente
+ embalagem) daquele produto. Junto com `configuracoes` (perda, invisível), dá o custo direto ao vivo:
ingredientes → +perda → +invisível. Mão de obra e margem **não** entram aqui — elas só existem quando
existe um pedido real (§5.1), porque dependem do tempo que ela efetivamente vai gastar naquele pedido.

### 3.2 `produto_custo_snapshot`

Resultado do custo direto acima (**sem mão de obra, sem margem**), fotografado por unidade de venda. Um
produto pode ter vários snapshots ao longo do tempo (preço de insumo mudou); o mais recente é o que
aparece na tela de produtos, e o snapshot vigente no momento do orçamento é o que fica preso no pedido.

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `produto_id` | FK → produtos |
| `configuracao_id` | FK → configuracoes (qual versão de config foi usada) |
| `custo_ingredientes_centavos` | int (por unidade de venda) |
| `custo_perda_centavos` | int (por unidade de venda) |
| `custo_invisivel_centavos` | int (por unidade de venda) |
| `custo_direto_total_centavos` | int (soma dos 3 acima, por unidade de venda) |
| `calculado_em` | timestamp |

**Resolve:** separa "quanto custa em ingredientes hoje" (ficha técnica sempre viva) de "quanto custava
quando o cliente comprou" (histórico financeiro estável) — sem isso, mudar o preço de um insumo
reescreveria silenciosamente o lucro de pedidos já entregues. Mão de obra fica de fora de propósito:
ela é sempre específica do pedido (§5.1).

---

## 4. `clientes`

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `nome` | text |
| `telefone_whatsapp` | text |
| `endereco_entrega` | text, nullable |
| `observacoes` | text, nullable |

---

## 5. `pedidos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `cliente_id` | FK → clientes | |
| `status` | enum(`orcamento`,`confirmado`,`producao`,`entregue`,`cancelado`) | |
| `data_pedido` | date | |
| `data_entrega_prevista` | date | usada para agrupar "Hoje/Amanhã/Próximos dias" |
| `observacoes` | text, nullable | |

### 5.1 `pedido_itens`

Aqui é onde ingredientes (escalam com quantidade) e mão de obra (não escalam — é o tempo real digitado
para *esse* pedido) se juntam. Tudo abaixo é calculado uma vez, no orçamento, e **congelado**.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `pedido_id` | FK → pedidos | |
| `produto_id` | FK → produtos | |
| `produto_custo_snapshot_id` | FK → produto_custo_snapshot | foto do custo direto (ingredientes) no momento do orçamento |
| `quantidade` | numeric | kg (ex.: 2.5) se `produto.modo_venda=kg`, ou nº inteiro de unidades/peças se `=unidade` |
| `tempo_e_por_unidade` | bool | só relevante se `modo_venda=unidade` — ver nota abaixo. Sempre `false` p/ produtos por kg |
| `tempo_preparo_minutos` | int | tempo **real estimado por ela** pra esse pedido específico (livre, não calculado) — significado depende de `tempo_e_por_unidade` |
| `custo_ingredientes_centavos` | int | `quantidade * produto_custo_snapshot.custo_direto_total_centavos` |
| `custo_mao_obra_centavos` | int | `(configuracoes.meta_salario_mensal_centavos / horas_trabalho_mes) * (tempo_total_minutos / 60)`, onde `tempo_total_minutos = tempo_e_por_unidade ? tempo_preparo_minutos * quantidade : tempo_preparo_minutos` |
| `custo_producao_total_centavos` | int | `custo_ingredientes_centavos + custo_mao_obra_centavos` |
| `margem_lucro_centavos` | int | `% de configuracoes.margem_lucro_padrao_percentual` sobre o total acima |
| `preco_venda_sugerido_centavos` | int | `custo_producao_total_centavos + margem_lucro_centavos` |
| `preco_venda_final_centavos` | int | preço total combinado com o cliente (pode diferir do sugerido) |

> **Lote fechado vs. contagem avulsa (só p/ `modo_venda=unidade`).** Ela normalmente vende esses
> produtos em lote fechado (ex.: "1 caixa com 12 brigadeiros"), mas às vezes é contagem avulsa (ex.:
> "5 bolos de pote"). São dois jeitos diferentes de pensar o tempo:
> - **Lote** (`tempo_e_por_unidade = false`): `quantidade` é o número de lotes, e ela digita o tempo
>   **total** pra fazer aquele(s) lote(s) inteiro(s) — igual já funciona pra produtos por kg.
> - **Avulso/individual** (`tempo_e_por_unidade = true`): `quantidade` é o número de peças, e ela digita
>   só o tempo de **uma unidade** — o sistema multiplica pelo `quantidade` pra achar o tempo total.
>
> `produtos.tamanho_lote_padrao` é só uma sugestão de preenchimento pro campo `quantidade` quando o modo
> mais comum daquele produto é venda em lote — não obriga nada, ela pode sempre escolher o outro modo
> nesse pedido específico.

**Resolve o rateio do Domínio 2:** na entrega, `SUM(preco_venda_final_centavos)` é o valor recebido;
`SUM(custo_producao_total_centavos)` é o custo real; a diferença entre preço final e sugerido já
embute qualquer desconto dado. O relatório mensal soma isso por período sem precisar recalcular nada —
é leitura pura dos valores já congelados aqui. (Preço "por kg", se ela quiser ver assim na tela, é só
`preco_venda_final_centavos / quantidade` — não precisa ser guardado.)

### 5.2 `pedido_pagamentos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `pedido_id` | FK → pedidos | |
| `tipo` | enum(`sinal`,`saldo`,`outro`) | |
| `valor_centavos` | int | |
| `forma_pagamento` | enum(`pix`,`dinheiro`,`cartao`,`outro`) | |
| `data_pagamento` | timestamp | |
| `confirmado` | bool | |

**Sem trava de sinal mínimo** (decisão revisada — ver `00-negocio.md` §3): `orcamento` → `confirmado`
é livre, não depende de nenhum pagamento registrado. A única regra de negócio que continua existindo
(aplicação, não constraint de banco) é `producao`/`confirmado` → `entregue`, que exige
`SUM(pedido_pagamentos.valor_centavos)` ≥ soma de `pedido_itens.preco_venda_final_centavos` daquele
pedido — ou seja, só marca como entregue quando o saldo estiver zerado, seja esse pagamento único
(sem sinal) ou em duas partes (sinal + saldo).

---

## 6. `transacoes_financeiras` (ledger único do dashboard)

Toda movimentação de dinheiro real passa por aqui — é a única tabela que o Domínio 4 (Dashboard) lê.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `tipo` | enum(`entrada`,`saida`) | |
| `categoria` | enum(`sinal_pedido`,`saldo_pedido`,`compra_insumo`,`compra_diversa`,`outro`) | |
| `valor_centavos` | int | |
| `data` | date | |
| `descricao` | text, nullable | "Fiz de Venda" / "Gastei no Mercado" na UI vem daqui |
| `pedido_pagamento_id` | FK → pedido_pagamentos, nullable | preenchido quando `categoria` é sinal/saldo |
| `compra_insumo_id` | FK → compras_insumos, nullable | preenchido quando `categoria` é compra_insumo |

**Resolve o Domínio 4:** entradas/saídas/saldo do mês são um `GROUP BY tipo, categoria` nesta tabela —
não precisa ficar somando `pedidos` e `compras_insumos` em queries separadas toda vez.

---

## 7. `compras_insumos` ("Gastei no Mercado")

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `insumo_id` | FK → insumos, nullable | nulo = gasto diverso não ligado a um insumo cadastrado |
| `data_compra` | date | |
| `quantidade_comprada` | numeric, nullable | |
| `valor_centavos` | int | |
| `observacao` | text, nullable | |

Ao salvar uma compra com `insumo_id` preenchido: (1) cria linha em `transacoes_financeiras`
(`saida` / `compra_insumo`), (2) cria linha em `insumo_historico_precos` (`origem = compra`) e (3)
atualiza o cache `insumos.embalagem_preco_centavos`. Assim ela só digita o preço uma vez e a ficha
técnica já reflete o valor novo.

---

## 8. `listas_compra` (Lista de Compras Automática)

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `data_inicio_periodo` | date |
| `data_fim_periodo` | date |
| `status` | enum(`rascunho`,`concluida`) |

### 8.1 `listas_compra_itens`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | |
| `lista_compra_id` | FK → listas_compra | |
| `insumo_id` | FK → insumos | |
| `quantidade_necessaria` | numeric | agregado de `receita_itens.quantidade_utilizada * pedido_itens.quantidade` |
| `preco_estimado_centavos` | int | último preço conhecido do insumo |
| `comprado` | bool | |

Geração: para pedidos com `status IN (confirmado, producao)` e `data_entrega_prevista` no período,
junta `pedido_itens → produtos → receita_itens`, agrupa por `insumo_id` e soma
`quantidade * quantidade_utilizada` (já que `quantidade_utilizada` é "por unidade de venda", isso dá a
quantidade real do insumo pra quantidade pedida, seja em kg ou em unidades). Persistir o resultado (em
vez de só calcular on-the-fly) permite marcar itens como "já comprei" e manter histórico do que foi de
fato comprado.

---

## Resumo — como o schema resolve os dois pontos centrais

- **Ficha técnica / precificação**: `insumos` (custo unitário via preço/quantidade da embalagem) →
  `receita_itens` (o "quanto de cada por unidade de venda" da receita) → aplica `configuracoes`
  (perda, invisível) → custo direto fotografado em `produto_custo_snapshot`. A ficha em si (`produtos`
  + `receita_itens`) fica sempre viva e recalculável; o snapshot é o que garante que o passado não
  muda sozinho. Mão de obra e margem só entram quando existe um pedido de verdade, porque dependem do
  tempo real gasto naquele pedido — por isso vivem em `pedido_itens`, não no snapshot do produto.
- **Rateio do fluxo de encomenda**: `pedido_itens` congela, num único lugar, ingredientes (escalado
  pela `quantidade`) + mão de obra (calculada do `tempo_preparo_minutos` digitado) + margem + preço
  final combinado. Na entrega não existe nenhum "cálculo mágico de divisão de dinheiro" — o dinheiro
  que entra é só uma entrada em `transacoes_financeiras`; a divisão em custo/mão de obra/lucro é uma
  **leitura** dos valores já congelados em `pedido_itens`, agregada por período para o dashboard.

## Decisões já tomadas (26/09/2026)

1. **Custo invisível = percentual sobre insumos.** Sem modo alternativo "valor fixo" — schema
   simplificado para só esse caminho (campo único `custo_invisivel_percentual`).
2. **`configuracoes` é versionada** desde já (append-only + `vigente_desde`), não é otimização
   prematura — cada `produto_custo_snapshot` referencia a versão usada.
3. **Ela vende por kg (bolos) ou por unidade (brigadeiro e afins).** `produtos.modo_venda` decide qual;
   toda a ficha técnica (`receita_itens`, `produto_custo_snapshot`) é expressa "por unidade de venda"
   (1kg ou 1 unidade, conforme o modo) em vez de existir um cadastro por tamanho (P/M/G).
4. **Mão de obra não tem fórmula fixa de escala.** Não existe `tempo_preparo_minutos_por_kg`: o tempo é
   sempre digitado manualmente por pedido em `pedido_itens.tempo_preparo_minutos` (com uma sugestão
   inicial vinda de `produtos.tempo_preparo_estimado_minutos`, mas totalmente livre pra ela ajustar).
   Consequência direta: mão de obra e margem saíram do snapshot do produto (que agora só tem custo
   direto de ingredientes) e passaram a ser calculadas e congeladas por pedido.
5. **Sem peso mínimo/máximo por sabor.** Confirmado que não existe essa regra de negócio — o schema
   aceita qualquer `quantidade` positiva, sem validação de faixa.
6. **Produtos por unidade podem ser vendidos em lote fechado ou avulso, e isso muda o pedido a pedido.**
   `produtos.tamanho_lote_padrao` guarda a sugestão de lote mais comum (ex.: 12), mas cada
   `pedido_itens` tem `tempo_e_por_unidade` pra dizer se o tempo digitado é o **total do lote** (padrão,
   `false`) ou o tempo de **uma peça só** (`true`, o sistema multiplica pela quantidade). Não existe mais
   pergunta em aberto aqui — ambos os casos ("caixa de 12" e "5 bolos de pote avulsos") são suportados.

Sem perguntas em aberto no momento — próximo passo é discutir a stack técnica (Next.js + Node.js) para
implementar esse modelo.
