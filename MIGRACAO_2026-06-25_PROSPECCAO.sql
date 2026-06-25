-- =====================================================================
--  MIGRAÇÃO 25/06/2026 — PROSPECÇÃO REAL DA CAPTAÇÃO (Josélia)
--  Cole no Supabase → SQL Editor → Run. Idempotente, seguro repetir.
--
--  A captação só tinha INSERT + SELECT dos próprios prospects. Para a tela
--  real de Prospecção funcionar (corrigir/excluir), libera UPDATE e DELETE
--  ESCOPADOS aos prospects dela (captado_por = ela), sem poder mudar o dono
--  e só excluindo o que ainda está em 'prospect' (não distribuído a chef).
-- =====================================================================

drop policy if exists restaurantes_captacao_upd on restaurantes;
drop policy if exists restaurantes_captacao_del on restaurantes;

create policy restaurantes_captacao_upd on restaurantes for update
  using (meu_papel() = 'captacao' and captado_por = auth.uid())
  with check (meu_papel() = 'captacao' and captado_por = auth.uid());

create policy restaurantes_captacao_del on restaurantes for delete
  using (meu_papel() = 'captacao' and captado_por = auth.uid() and status = 'prospect');

-- =====================================================================
--  PRONTO.
-- =====================================================================
