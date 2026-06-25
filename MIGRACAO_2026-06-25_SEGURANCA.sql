-- =====================================================================
--  MIGRAÇÃO 25/06/2026 — ENDURECIMENTO DE SEGURANÇA (auditoria "mega brain")
--  Cole no Supabase → SQL Editor → Run. Tudo idempotente, seguro repetir.
--
--  Corrige falhas reais encontradas na auditoria do backend:
--   [A] Storage 'consultorias': QUALQUER usuário logado lia/sobrescrevia/
--       APAGAVA as fotos privadas de TODAS as consultorias. Agora só o
--       diretor e o chef DONO do agendamento (pasta = agendamento_id).
--   [B] Storage 'publico': qualquer logado podia apagar/trocar logo, fotos
--       de chefs/receitas (defacement). Agora só equipe (diretor/chef/captacao).
--   [C] agendamentos (chef): chef podia criar consultoria apontando para
--       restaurante de OUTRO chef. Agora o restaurante tem que ser dele.
--   [D] sou_diretor(): removida a exceção por e-mail fixo (super-admin agora
--       é só quem tem perfil papel='diretor' — o admin já tem).
--   [E] cidades: leitura agora exige um perfil de equipe (não basta logar).
--   [F] trigger de notificação: à prova de chef_id duplicado (limit 1).
-- =====================================================================

-- ---------------------------------------------------------------------
--  [D] sou_diretor() — sem exceção por e-mail (o admin já tem perfil diretor)
-- ---------------------------------------------------------------------
create or replace function sou_diretor()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select papel = 'diretor' from perfis where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
--  [C] agendamentos do chef — restaurante TEM que ser do próprio chef
-- ---------------------------------------------------------------------
drop policy if exists agendamentos_chef on agendamentos;
create policy agendamentos_chef on agendamentos for all
  using (chef_id = meu_chef_id())
  with check (
    chef_id = meu_chef_id()
    and (select chef_id from restaurantes where id = restaurante_id) = meu_chef_id()
  );

-- ---------------------------------------------------------------------
--  [E] cidades — exige perfil de equipe (não só estar logado)
-- ---------------------------------------------------------------------
drop policy if exists cidades_select on cidades;
create policy cidades_select on cidades for select
  using (meu_papel() in ('diretor','chef','captacao','cliente'));

-- ---------------------------------------------------------------------
--  [F] trigger de notificação — à prova de chef_id com mais de um perfil
-- ---------------------------------------------------------------------
create or replace function notificar_chef_restaurante()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_dest uuid;
begin
  if new.chef_id is not null then
    select id into v_dest from perfis where chef_id = new.chef_id limit 1;
    if v_dest is not null and v_dest is distinct from auth.uid() then
      if tg_op = 'INSERT'
         or (tg_op = 'UPDATE' and (old.status is distinct from new.status or old.chef_id is distinct from new.chef_id)) then
        insert into notificacoes (destinatario_id, titulo, mensagem)
        values (
          v_dest,
          'Restaurante atualizado pela coordenação',
          'O restaurante "' || new.nome || '" foi atualizado. Status atual: ' || coalesce(new.status, '—') || '.'
        );
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
--  [A]/[B] STORAGE — políticas por DONO
-- ---------------------------------------------------------------------

-- Converte com segurança a 1ª pasta do caminho (= agendamento_id) em uuid.
-- Caminho de upload usado pelo app: '<agendamento_id>/<arquivo>'.
create or replace function agendamento_uuid_safe(p text)
returns uuid language plpgsql immutable as $$
begin
  return p::uuid;
exception when others then
  return null;
end $$;

-- [B] Bucket 'publico': leitura pública continua; ESCRITA só equipe.
drop policy if exists pub_read  on storage.objects;
drop policy if exists pub_write on storage.objects;
create policy pub_read on storage.objects for select
  using (bucket_id = 'publico');
create policy pub_write on storage.objects for all
  using (bucket_id = 'publico' and meu_papel() in ('diretor','chef','captacao'))
  with check (bucket_id = 'publico' and meu_papel() in ('diretor','chef','captacao'));

-- [A] Bucket 'consultorias' (privado): só diretor + chef DONO do agendamento.
drop policy if exists cons_rw    on storage.objects;
drop policy if exists cons_owner on storage.objects;
create policy cons_owner on storage.objects for all
  using (
    bucket_id = 'consultorias' and (
      sou_diretor()
      or chef_do_agendamento(agendamento_uuid_safe((storage.foldername(name))[1])) = meu_chef_id()
    )
  )
  with check (
    bucket_id = 'consultorias' and (
      sou_diretor()
      or chef_do_agendamento(agendamento_uuid_safe((storage.foldername(name))[1])) = meu_chef_id()
    )
  );

-- =====================================================================
--  PRONTO. Recarregue o app (Ctrl+Shift+R).
--  AÇÃO MANUAL recomendada no painel (fora do SQL):
--   Authentication → Providers → desligar "Allow new users to sign up"
--   (todos os usuários são criados à mão; isso fecha cadastro anônimo).
-- =====================================================================
