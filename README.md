# Movz

Aplicação pessoal mobile-first para acompanhar treinos, evolução e despesas, com isolamento de dados por usuário no Supabase.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase Auth/PostgreSQL/RLS, Zod, Vitest e Cloudflare Workers via OpenNext.

## Executar localmente

Requer Node.js 22+ e npm. Copie `.env.example` para `.env.local`, preencha a URL e a chave publicável do projeto Supabase e execute:

```bash
npm install
npm run dev
```

Nunca use a chave `service_role` no cliente. Configure no Supabase Auth a URL local `http://localhost:3000` e, em produção, o domínio do Worker.

## Banco e autenticação

As migrations versionadas estão em `supabase/migrations`. Com Supabase CLI autenticado e o projeto ligado:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

A migration cria perfis, exercícios, treinos, itens de treino, execuções, séries, categorias, recorrências e despesas. Todas as tabelas têm RLS; policies e chaves compostas restringem leitura, escrita e relacionamentos ao proprietário autenticado.

## Qualidade

```bash
npm run lint
npm run test
npm run build
```

## Cloudflare

O deploy oficial usa `@opennextjs/cloudflare`, `open-next.config.ts` e `wrangler.jsonc`:

```bash
npm run preview
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put NEXT_PUBLIC_SITE_URL
npm run deploy
```

Antes do deploy, configure as variáveis no ambiente do Cloudflare e ajuste `NEXT_PUBLIC_SITE_URL`.

## Estrutura

- `src/app`: rotas, layouts e handlers
- `src/components`: interface mobile reutilizável
- `src/features`: regras, validações e ações por domínio
- `src/lib`: autenticação e clientes Supabase
- `supabase/migrations`: banco reproduzível, índices e RLS
