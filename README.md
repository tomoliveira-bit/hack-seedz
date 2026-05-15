# Hackathon Seedz · App de Avaliação

App web para os 15 avaliadores Seedz classificarem os 22 candidatos do Programa de Estágio Tech 2026 em tempo real durante o sprint.

- **Avaliadores** (`/`) — selecionam o nome, vão pra lista, avaliam 6 critérios por candidato
- **Banca** (`/banca`) — ranking completo, atualiza ao vivo via Supabase Realtime
- **Telão** (`/vencedor`) — mostra só o 1º lugar, atualiza ao vivo

Stack: Next.js 16 (App Router) + TypeScript + Tailwind 4 + Supabase + Vercel.

---

## Setup pra rodar local

1. `npm install`
2. Copie `.env.local.example` pra `.env.local` e preencha as 2 variáveis do Supabase
3. `npm run dev` — abre em http://localhost:3000

---

## Deploy — passo a passo (assumindo zero experiência)

### 1) Criar projeto no Supabase

1. Vá em https://supabase.com e crie uma conta (grátis)
2. **New project** → escolha nome (ex: `hackathon-seedz`), senha forte do banco, região mais próxima (São Paulo)
3. Espera ~2min até o projeto ficar verde
4. No menu lateral, **Settings → API**:
   - Copie **Project URL** → essa é a `NEXT_PUBLIC_SUPABASE_URL`
   - Copie **anon public key** → essa é a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Guarda as duas, vai precisar no passo 4

### 2) Rodar o SQL do schema

1. No menu lateral do Supabase, abra **SQL Editor**
2. Clique **New query**
3. Cole o conteúdo de [`supabase/migrations/00001_init.sql`](supabase/migrations/00001_init.sql) e rode (botão **Run**)
4. Nova query: cole o conteúdo de [`supabase/seed.sql`](supabase/seed.sql) e rode

### 3) Conferir o Realtime

A migration já habilita Realtime na tabela `evaluations`. Pra conferir:
- **Database → Replication** → veja se a tabela `evaluations` aparece marcada na publication `supabase_realtime`. Se não, marca.

### 4) Configurar `.env.local` local (opcional, só pra testar antes de subir)

Crie o arquivo `.env.local` na raiz do projeto com:
```
NEXT_PUBLIC_SUPABASE_URL=cole_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui
```

Roda `npm run dev` e testa em http://localhost:3000.

### 5) Subir pro GitHub

```bash
git add .
git commit -m "App de avaliação Hackathon Seedz"
gh repo create hack-seedz --public --source=. --push
```

(Se `gh` ainda não está autenticado, rode `gh auth login` primeiro — escolha GitHub.com, HTTPS, login pelo navegador.)

### 6) Deploy na Vercel

```bash
vercel --prod
```

Na primeira vez vai pedir login (`vercel login`). Depois ele detecta Next.js, pergunta o nome do projeto e sobe. Quando pedir as env vars, cole `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

URLs finais:
- `https://<seu-projeto>.vercel.app/` — avaliadores
- `https://<seu-projeto>.vercel.app/banca` — banca
- `https://<seu-projeto>.vercel.app/vencedor` — telão

---

## Critérios de avaliação

Escala 1-3 em 6 critérios:

1. Habilidade com IA
2. Conhecimento Seedz/agro
3. Curiosidade
4. Inovação
5. Raça
6. Trabalho em equipe

(1 = abaixo, 2 = no esperado, 3 = acima)

---

## Checklist de testes — rodar antes de sábado

- [ ] 2 avaliadores diferentes logam simultaneamente e veem todos os 22 candidatos
- [ ] Salvo uma avaliação, status fica "Avaliado"
- [ ] Volto ao formulário, valores estão preenchidos
- [ ] Edito uma nota, salvo, `/banca` atualiza em outra aba sozinho (realtime)
- [ ] `/banca` filtro por grupo funciona
- [ ] `/vencedor` mostra o candidato com maior pontuação total
- [ ] `/vencedor` atualiza automaticamente quando uma nota muda
- [ ] Funciona bem em celular 375px de largura
- [ ] Não dá pra salvar sem preencher os 6 critérios
- [ ] Mesmo avaliador não cria avaliações duplicadas

---

## Estrutura

```
app/
  page.tsx                          → login do avaliador
  avaliar/page.tsx                  → lista de candidatos por grupo
  avaliar/[candidateId]/page.tsx    → formulário de avaliação
  banca/page.tsx                    → ranking completo (ao vivo)
  vencedor/page.tsx                 → telão (1º lugar, ao vivo)
components/
  EvaluatorPicker, CandidateCard, ScoreButton, RankingTable
lib/
  supabase.ts, types.ts
supabase/
  migrations/00001_init.sql, seed.sql
```

---

## Notas de operação

- Não há autenticação. O "login" é apenas selecionar o nome no dropdown — `evaluator_id` fica em `localStorage`.
- A constraint `unique(evaluator_id, candidate_id)` garante que um mesmo avaliador não duplica avaliações; o salvar usa `upsert`.
- Realtime escuta `*` (INSERT/UPDATE/DELETE) em `evaluations` nas páginas `/banca` e `/vencedor`.
- `/avaliar` não usa realtime — só estado local e o fetch inicial.
