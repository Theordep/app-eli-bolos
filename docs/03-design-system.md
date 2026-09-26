# Eli Bolos — Design System (v1)

> Companheiro dos demais docs em `docs/`. Formalizado a partir do que **já está em uso de verdade**
> no código (auditado via grep, não inventado) — a única coisa nova aqui é a disciplina de nomear e
> documentar, e a estratégia de desktop, que ainda não existia.
>
> Inspirado na estrutura de um design system de referência (tokens → tipografia → espaçamento →
> elevação → componentes → do's/don'ts), mas **não** na estética dele — aquele era um site de
> marketing de fintech (hero gigante, gradiente, tipografia de 200px). Este app é usado várias vezes
> por dia por uma pessoa só, no meio da produção de bolos — a prioridade é ler rápido e tocar fácil,
> não impressionar em 5 segundos.

## Princípio geral

Zero jargão, uso rápido, uma coisa bold por tela (nunca duas). Isso já vem do `00-negocio.md` e do
`frontend-design` skill — o design system só dá nome e número pro que essa regra já significava na
prática.

---

## Tokens — Cores

Extraídas da logo real (ver conversa de criação do `public/logo.png`), não escolhidas a esmo.

| Nome | Valor | Variável CSS | Papel |
|---|---|---|---|
| Creme | `#fdf3ec` | `--background` | Fundo da página inteira |
| Tinta (marrom "Bolos") | `#4a2e1f` | `--foreground` | Texto principal, títulos |
| Branco-cartão | `#ffffff` | `--card` | Superfície de card/input, acima do fundo creme |
| Rosa (script "Eli") | `#c85f5c` | `--primary` | Botão principal, foco de input, badge de status ativo |
| Branco sobre rosa | `#ffffff` | `--primary-foreground` | Texto/ícone em cima do `--primary` |
| Blush claro | `#fce9e1` | `--secondary` / `--accent` | Card de destaque secundário (resumo, total), hover |
| Marrom médio | `#6b3a1e` | `--secondary-foreground` | Texto em cima do blush |
| Bege neutro | `#f7e9e1` | `--muted` | Fundo de estado vazio/desabilitado |
| Marrom-acinzentado | `#8a6f63` | `--muted-foreground` | Texto secundário, legendas, dica de campo |
| Bege-borda | `#ead9ce` | `--border` / `--input` | Toda borda — nunca cinza puro |
| Rosa | `#c85f5c` | `--ring` | Anel de foco (mesma cor do primary) |
| Vermelho semântico | `oklch(0.577 0.245 27.325)` | `--destructive` | Só erro/apagar — nunca decorativo |

**Regra:** nenhuma cor Tailwind crua (`text-red-600`, `bg-gray-100` etc.) em componente nenhum — sempre
os tokens semânticos acima. Isso já é 100% verdade no código hoje (auditado); manter assim.

---

## Tokens — Tipografia

Duas famílias, papéis bem separados — nunca misturadas na mesma função.

| Família | Variável | Onde usa | Peso |
|---|---|---|---|
| **Fraunces** (serifada) | `--font-fraunces` (exposta como `font-heading`) | Só `h1`/`h2` de tela e números de destaque (total do pedido, "Meu lucro") | 600 |
| **Geist Sans** | `--font-geist-sans` (padrão do `<html>`) | Todo o resto — labels, inputs, botões, texto de corpo | 400 / 500 |

`Geist Mono` está carregada mas **sem nenhum uso real** no app hoje — é peso morto (uma fonte a mais
baixada à toa). Remover do `layout.tsx` na próxima limpeza.

### Escala (auditada, não inventada)

| Papel | Classe Tailwind | Tamanho | Uso real |
|---|---|---|---|
| Destaque (dashboard, total) | `font-heading text-2xl font-semibold` | 24px | "Meu lucro", título do login |
| Título de tela | `font-heading text-xl font-semibold` | 20px | `<h1>` de toda página |
| Título de seção/card | `font-heading text-lg font-semibold` | 18px | `<h2>`, cabeçalho do cabeçalho fixo |
| Corpo | `text-base` | 16px | texto de `<input>` (nunca menor — evita zoom automático no iOS) |
| Padrão de UI | `text-sm` | 14px | a imensa maioria: linha de lista, botão, label |
| Legenda/dica | `text-xs` | 12px | texto de ajuda abaixo de campo, metadado secundário |

---

## Tokens — Espaçamento & Raio

**Base:** múltiplos de 4px (padrão Tailwind) — não criamos uma escala própria, só documentamos o que
já se repete.

| Papel | Valor | Classe |
|---|---|---|
| Gap entre ícone e texto | 4–6px | `gap-1` / `gap-1.5` |
| Gap padrão entre elementos de uma linha | 8px | `gap-2` |
| Gap entre itens de lista/seções | 12px | `gap-3` / `space-y-2` a `space-y-3` |
| Padding de item de lista | 12px | `p-3` |
| Padding de card/input/botão (padrão) | 14px | `p-3.5` / `px-3.5 py-2.5` |
| Padding de página | 16px | `px-4 py-5` (definido uma vez no `AppLayout`) |
| Padding de card grande (vazio, destaque) | 24px | `p-6` |

### Raio de borda

| Elemento | Classe | Valor real (`--radius: 0.75rem`) |
|---|---|---|
| Elemento pequeno aninhado (botão de ícone dentro de um item) | `rounded-lg` | 12px |
| **Padrão** — card, input, select, botão, textarea | `rounded-xl` | 16.8px |
| Badge de status, pílula de nav | `rounded-full` | topo |

**Regra:** não introduzir um terceiro valor de raio "no meio". Se não é `rounded-lg` (elemento
aninhado) nem `rounded-full` (pílula/badge), é `rounded-xl` — ponto.

---

## Elevação

**Sem `box-shadow` em nenhum componente de UI.** A hierarquia visual vem de troca de superfície
(`--background` creme → `--card` branco → `--secondary` blush), igual o Fluz faz com
branco/cinza-linho/osso — só que na nossa paleta quente em vez de neutra.

A única exceção deliberada no app inteiro: o `drop-shadow` rosado sutil atrás da logo na tela de
login (`rgba(200,95,92,0.25)`), o "um lugar de ousadia" que o `frontend-design` skill recomenda —
nunca mais que um por tela, e nunca em componente que se repete (card, item de lista).

---

## Componentes

### Botão primário (ação principal da tela)
`bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium hover:opacity-90` — largura
total (`w-full`) em formulário, largura de conteúdo em ação de lista/cabeçalho.

### Botão secundário
`bg-secondary text-secondary-foreground` — mesmo raio/padding, usado pra ação de apoio (ex.:
"Adicionar" dentro de um formulário aninhado).

### Botão fantasma / ícone
`text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2` — ícone de cabeçalho
(Configurações, Clientes, Sair), sem fundo em repouso.

### Card
`rounded-xl border border-border bg-card p-3` (item de lista) ou `p-3.5` (card de conteúdo/formulário
aninhado) — nunca sombra, sempre borda + `bg-card`.

### Card de destaque (resumo, total)
`rounded-xl bg-secondary p-3.5` — mesma família do card comum, mas usa a superfície blush em vez de
branco, pra puxar o olho sem precisar de sombra ou borda mais grossa.

### Input / Select / Textarea
`rounded-xl border border-input bg-card px-3.5 py-2.5 text-base outline-none focus:border-ring
focus:ring-2 focus:ring-ring/30` — `text-base` (não `text-sm`) especificamente pra não disparar zoom
automático em iOS Safari.

### Badge de status (`StatusBadge`)
`rounded-full px-2.5 py-1 text-xs font-medium`, cor por status (`orcamento`=muted, `confirmado`
=secondary, `producao`=primary/15, `entregue`=primary sólido, `cancelado`=destructive/10) — única
família de pílula do sistema.

### Estado vazio
`rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground` (ou
`p-6` quando é o vazio principal da tela, não um vazio secundário).

---

## Do's and Don'ts

### Do
- Usar sempre os tokens semânticos de cor (`bg-primary`, `text-muted-foreground`...) — nunca uma cor
  Tailwind crua.
- Manter `text-base` (16px) em todo `<input>`, mesmo quando o resto da tela usa `text-sm`.
- Uma "coisa bold" por tela no máximo (o glow da logo no login, o card rosa do "Meu Lucro" no
  dashboard) — todo o resto fica quieto.
- Elevação por troca de superfície (creme → branco → blush), nunca por sombra.
- `rounded-xl` como padrão de tudo; `rounded-lg` só pra elemento pequeno aninhado; `rounded-full` só
  pra badge/pílula.

### Don't
- Não usar `box-shadow` genérico cinza em card nenhum.
- Não adicionar uma terceira família de fonte — Fraunces é só para título/destaque, o resto é sempre
  Geist Sans.
- Não deixar um formulário ou lista mais estreito que `max-w-md` **estático** em qualquer largura de
  tela — isso é o problema atual do desktop (ver seção Layout abaixo).
- Não copiar estética de referência de marketing (hero gigante, gradiente decorativo, tipografia de
  100px+) — este é um app de uso diário, não uma landing page.

---

## Layout — mobile vs. desktop

**Estado atual (o problema que motivou este documento):** toda tela usa `mx-auto max-w-md`, sempre —
inclusive em monitor grande. Resultado: no desktop o app vira uma coluna estreita de celular flutuando
no meio de uma tela vazia.

**Direção proposta** (implementação é o próximo passo, não faz parte deste documento):

- **Até `md` (< 768px):** continua exatamente como está hoje — `max-w-md`, menu inferior fixo, um
  card/lista por linha. Não mexer — já testado e aprovado pela Eli.
- **A partir de `md`:** o menu inferior vira uma **barra lateral fixa** (os mesmos itens: Início,
  Pedidos, Produtos, Insumos), liberando a largura toda pro conteúdo.
- **Formulários** (Novo Insumo, Novo Produto, Novo Pedido, Configurações): continuam com largura
  limitada mesmo no desktop (`max-w-md` ou `max-w-lg`) — um formulário de 3 campos esticado até a borda
  da tela é tão ruim quanto um formulário espremido demais.
- **Listas e o dashboard**: passam a usar a largura disponível — grid de 2–3 colunas pra
  Insumos/Produtos/Pedidos no desktop, cards de resumo do dashboard lado a lado em vez de empilhados.
- **Tela de detalhe** (pedido, produto): no desktop pode virar duas colunas (dados à esquerda, ação/
  resumo financeiro fixo à direita) em vez de tudo empilhado verticalmente.
