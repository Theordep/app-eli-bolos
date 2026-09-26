# Eli Bolos — Escopo de Negócio (MVP)

> Documento vivo. Atualizar sempre que uma regra de negócio mudar antes de mexer no código.

## 1. Contexto

App de gestão financeira e encomendas para a confeitaria artesanal **Eli Bolos**. Usuária final: uma
confeiteira sem letramento contábil, que hoje anota tudo em caderno. Uso diário deve levar **menos de
5 minutos**.

Regra de ouro: **zero jargão contábil na interface**. Por baixo dos panos o sistema faz partida
dobrada, DRE, rateio de custo fixo etc. — na tela ela só vê "Fiz de Venda", "Gastei no Mercado",
"Meu Lucro".

Stack (Next.js + Node.js) fica para depois — este documento e o de modelo de dados tratam só do
domínio do negócio, sem amarrar em nenhuma tecnologia.

## 2. Domínio 1 — Ficha Técnica e Precificação

Fórmula de custo de um produto (ex.: "Bolo de Chocolate P"):

1. **Custos diretos**: soma de `(preço da embalagem / qtd da embalagem) * qtd usada` para cada
   ingrediente e material de embalagem da receita.
2. **Taxa de perda**: +10% sobre o custo dos ingredientes (desperdício, erro de medida etc.).
3. **Custos invisíveis**: gás, luz, água — percentual (ex.: 15%) sobre o custo de insumos, ou valor
   fixo por produto.
4. **Mão de obra**: `(meta de salário mensal / horas trabalhadas no mês) * tempo de preparo do
   pedido`. O tempo não segue uma fórmula fixa (não escala automaticamente com peso/quantidade) — ela
   digita o tempo estimado a cada pedido, porque na prática varia por decoração/complexidade e não dá
   pra prever com uma conta só.
5. **Margem de lucro**: 20–30% aplicada sobre a soma de tudo acima.

Saída: **Custo de Produção** (soma de 1–4) e **Preço de Venda Sugerido** (Custo de Produção + margem).

### Ajustes propostos (e já decididos em 26/09/2026)

- **Congelar o cálculo por pedido.** O preço dos insumos muda com o tempo (inflação de alimentos). Se
  recalcularmos o custo de um pedido antigo com preço novo, o relatório financeiro do mês passado
  muda sozinho. Solução: quando ela monta um orçamento, o sistema **fotografa** o custo/preço
  calculado naquele momento e usa essa foto para sempre — a ficha técnica em si continua "viva" e
  recalcula com os preços atuais toda vez que ela abre a tela de produtos.
- **Custo invisível = percentual sobre insumos** (decidido). Sem alternativa de "valor fixo" no MVP.
- **Configurações de precificação são versionadas** (meta de salário, margem, % de perda, % de custo
  invisível, % mínimo de sinal). Cada cálculo de ficha técnica guarda qual versão da configuração usou.
- **Histórico de preço dos insumos.** Toda vez que ela registra uma compra no mercado, o preço daquele
  insumo é atualizado automaticamente — ela não digita o custo do insumo duas vezes.
- **Venda por quilo (bolos) ou por unidade (brigadeiro e afins).** Ela não trabalha com P/M/G — bolos
  são vendidos por kg (1kg, 2kg, 5kg, 10kg...), mas ela também faz coisas como brigadeiro que são
  vendidas por unidade. Cada ficha técnica descreve o custo por "unidade de venda" (1kg ou 1 unidade,
  dependendo do produto); a quantidade concreta só é escolhida na hora do pedido.
- **Mão de obra sem fórmula automática.** Diferente do custo de ingredientes (que escala direto com a
  quantidade pedida), o tempo de preparo não escala de forma previsível — ela digita manualmente o
  tempo estimado em cada pedido, e o sistema só usa esse valor pra calcular a mão de obra e a margem
  daquele pedido específico.
- **Sem peso/quantidade mínima ou máxima por sabor** — não existe essa regra hoje.

## 3. Domínio 2 — Gestão de Encomendas

Fluxo (pelo WhatsApp, mas registrado no app):

1. **Orçamento** — escolhe produto(s) e quantidade, vê o preço sugerido, define o preço final
   combinado com o cliente. Um pedido pode ter mais de um produto.
2. **Confirmado (sinal pago)** — só entra na fila de produção depois que o sinal (padrão configurável,
   ex.: 50% via Pix) é registrado como recebido. O saldo devedor fica visível.
3. **Produção/Geladeira** — painel agrupado por "Para Hoje", "Para Amanhã", "Próximos Dias", ordenado
   pela data de entrega.
4. **Entregue** — confirma o recebimento do saldo. O sistema baixa o pedido, lança a entrada financeira
   final e o relatório mensal já sabe separar quanto daquele valor era custo, mão de obra e lucro
   (usando a foto de custo do passo 1 — não é um lançamento de dinheiro novo, é uma leitura).

### Ajustes propostos

- **Percentual mínimo de sinal configurável** (não travar em 50%).
- **Status de cancelamento** — precisa existir para tratar desistência/estorno de sinal sem sujar as
  estatísticas de pedidos entregues.
- **Preço final pode divergir do sugerido** (ela dá desconto, cliente pechincha) — o lucro real do
  pedido é calculado sobre o preço final combinado, não sobre o sugerido.

## 4. Domínio 3 — Lista de Compras Automática

A partir dos pedidos **confirmados/em produção** dentro de um período, o sistema soma os ingredientes
das fichas técnicas envolvidas (ex.: 3 bolos que usam 1 lata de leite condensado cada → lista mostra
3 latas) e gera uma lista de compras agregada, com o preço estimado (baseado no histórico de preço do
insumo).

## 5. Domínio 4 — Dashboard Financeiro Mensal

Tela inicial com o resumo do mês corrente:

- **Entradas**: sinais recebidos + saldos finais recebidos.
- **Saídas**: compras no mercado (ligadas ou não a um pedido específico) e compras diversas.
- **Saldo/Lucro Real**: entradas − saídas, com a quebra opcional "quanto foi custo, quanto foi salário
  seu, quanto foi lucro da empresa" para os pedidos entregues no período.

## 6. Fora de escopo do MVP (registrar para não esquecer)

- Controle de estoque real (baixa automática de insumo por unidade em estoque).
- Múltiplos usuários/funcionários.
- Multi-tenant (mais de uma confeitaria usando o mesmo sistema) — o modelo de dados não deve
  *impedir* isso no futuro, mas o MVP é single-tenant.
- Emissão fiscal/nota fiscal.

Ver [01-modelo-dados.md](01-modelo-dados.md) para o schema relacional que sustenta essas regras.
