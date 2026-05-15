-- Permite inserir avaliadores anonimamente (nome livre na tela de login)

drop policy if exists "anon insert evaluators" on evaluators;
create policy "anon insert evaluators" on evaluators for insert with check (true);
