# Eli Bolos — Stack e Arquitetura (v1)

> Companheiro de [00-negocio.md](00-negocio.md) e [01-modelo-dados.md](01-modelo-dados.md). Define
> como o app vai ser hospedado e onde os dados vivem — sem entrar em código ainda.

## Decisão

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend + Backend | **Next.js (App Router)**, hospedado na **Vercel** | Já era a stack decidida; Next.js moderno é full-stack (React Server Components + Server Actions), não precisa de um servidor Node separado |
| Banco de dados | **Supabase** (Postgres gerenciado) | Postgres de verdade, sem servidor pra manter, com tier grátis suficiente pro volume de uma confeitaria caseira |
| Autenticação | **Supabase Auth** | Vem junto do banco, sem custo extra, e é uma das libs oficialmente recomendadas pelo Next.js |
| Arquivos/fotos | **Supabase Storage** | Vem junto do mesmo projeto Supabase — bucket pra foto de bolo/produto/pedido |
| ORM | **Drizzle ORM** | Tipagem forte batendo com o schema do [01-modelo-dados.md](01-modelo-dados.md), migrations versionadas, leve o suficiente pro ambiente serverless da Vercel |
| Validação de formulário | **Zod** | Já é a lib recomendada na própria documentação do Next.js pra validar Server Actions |

## Por que Supabase em vez de "só um Postgres" (ex.: Neon)

Você confirmou duas coisas que pesam nessa escolha:

1. **O app precisa de login** — como vai ficar público na Vercel, sem senha qualquer um com o link
   veria pedidos e dados financeiros dela.
2. **Ela provavelmente vai querer subir fotos** (bolo pronto, referência de decoração).

Um Postgres puro (Neon, por ex.) resolveria só a parte de dados — auth e upload de arquivo teriam que
ser montados por fora. O Supabase já entrega os três (banco + auth + storage) num único projeto grátis,
então é menos peça pra manter funcionando.

## Como as camadas se encaixam

```
Navegador (celular da Eli)
        │  HTTPS
        ▼
   Vercel (Next.js App Router)
        │
        ├── Server Components  → leitura de dados (dashboard, lista de pedidos, ficha técnica)
        ├── Server Actions     → escrita de dados (criar pedido, registrar pagamento, dar baixa)
        └── Route Handlers     → só se precisar de algo tipo webhook no futuro (não previsto no MVP)
        │
        ▼
   Supabase (projeto único)
        ├── Postgres  (tabelas do 01-modelo-dados.md, acessadas via Drizzle)
        ├── Auth      (login da Eli — e-mail/senha, conta única criada por você, sem cadastro público)
        └── Storage   (bucket de fotos de produtos/pedidos)
```

Não existe "backend separado" — as Server Actions do Next.js **são** o backend. Isso elimina a
necessidade de hospedar um servidor Node à parte (o pedido original de "Node.js no backend" é atendido
pelo próprio runtime do Next.js rodando na Vercel).

## Autenticação — como isso funciona na prática

- Como é uso de uma pessoa só, não precisa de tela de cadastro público. Você cria a conta dela direto
  no painel do Supabase (e-mail + senha), ela só usa a tela de login.
- Todo o resto do app fica atrás de login: um `middleware`/Proxy do Next.js redireciona pra `/login`
  quem não tiver sessão válida, e cada leitura/escrita de dado real confere a sessão de novo do lado do
  servidor antes de tocar no banco (é o padrão de "Data Access Layer" que a documentação do Next.js
  recomenda — sem isso, um link de rota interna poderia vazar dado mesmo com o redirect no lugar certo).

## O que fica para depois (não é decisão de agora)

- Nome exato das tabelas/campos no banco (o [01-modelo-dados.md](01-modelo-dados.md) já é a fonte da
  verdade conceitual; a tradução pra schema do Drizzle é passo de implementação).
- Estrutura de pastas do projeto Next.js.
- Se/quando ela vai precisar trocar a própria senha sozinha (fluxo de "esqueci minha senha") — no MVP
  você pode resetar manualmente pelo painel do Supabase se precisar.

## Custo

Supabase free tier + Vercel Hobby (grátis) cobrem esse volume de uso sem custo mensal. Se o projeto
crescer muito (múltiplas confeitarias, muito tráfego), aí sim entra a conversa de plano pago — não é
uma preocupação do MVP.
