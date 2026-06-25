-- =====================================================================
--  MIGRAÇÃO 22/06/2026 — COMPLETA (junta os lotes b, c, d, e da sessão)
--  Cole no Supabase → SQL Editor → Run. Tudo idempotente, seguro repetir.
--  (equivalente a rodar MIGRACAO_2026-06-22b/c/d/e.sql em sequência)
-- =====================================================================

-- ---------- LOTE B: itens rápidos + cidades ----------
alter table aulas add column if not exists chef_nome text;
alter table chefs add column if not exists whatsapp text;
alter table cidades add column if not exists ano int;
update cidades set ano = extract(year from criado_em)::int where ano is null;
update chefs set foto_url = 'https://atiliorod-jpg.github.io/instituto-cesar-santos/luciano-roberto.jpg' where slug = 'luciano-roberto';
update chefs set foto_url = 'https://atiliorod-jpg.github.io/instituto-cesar-santos/atilio-leite.jpg'   where slug = 'atilio-leite';

-- ---------- LOTE C: receitas — separar ingredientes×preparo (2 casos seguros) ----------
update receitas set
  modo_preparo = regexp_replace(ingredientes, '^.*?(Modo\s+(e|de)\s+preparo.*)$', '\1', 'is'),
  ingredientes = trim(both E' \r\n' from regexp_replace(ingredientes, '(Modo\s+(e|de)\s+preparo).*$', '', 'is'))
where (modo_preparo is null or trim(modo_preparo) = '')
  and ingredientes ~* 'modo\s+(e|de)\s+preparo';
-- 5 receitas ficaram de fora (sem marcador no texto, risco de corromper conteúdo
-- ao separar automaticamente) — revisar manualmente em /area/receitas:
--   Bode das Arábias · Fava em duas texturas com carne de sol ·
--   Hambúrguer de Carne de Sol de Bode Com Creme de Queijo Coalho ·
--   Hambúrguer "Tropicalista Agridoce" · Pudim de Reis

-- ---------- LOTE D: link único do restaurante ----------
alter table restaurantes add column if not exists token text unique
  default encode(gen_random_bytes(16), 'hex');
update restaurantes set token = encode(gen_random_bytes(16), 'hex') where token is null;

create or replace function rpc_restaurante_publico(p_token text)
returns table (
  id uuid, nome text, tipo text, status text,
  cidade_nome text, chef_nome text, chef_foto text, chef_whatsapp text
)
language sql stable security definer set search_path = public as $$
  select r.id, r.nome, r.tipo, r.status,
         c.nome as cidade_nome,
         ch.nome as chef_nome, ch.foto_url as chef_foto, ch.whatsapp as chef_whatsapp
  from restaurantes r
  left join cidades c on c.id = r.cidade_id
  left join chefs   ch on ch.id = r.chef_id
  where r.token = p_token
$$;
grant execute on function rpc_restaurante_publico(text) to anon, authenticated;

create or replace function rpc_relatorios_restaurante(p_token text)
returns table (texto text, atualizado_em timestamptz, data_proximo date)
language sql stable security definer set search_path = public as $$
  select cr.texto, cr.atualizado_em, ag.data_proximo
  from consultoria_relatorios cr
  join agendamentos ag on ag.id = cr.agendamento_id
  join restaurantes r  on r.id = ag.restaurante_id
  where r.token = p_token
  order by cr.atualizado_em desc
$$;
grant execute on function rpc_relatorios_restaurante(text) to anon, authenticated;

create or replace function rpc_materiais_restaurante(p_token text)
returns table (id uuid, nome text, categoria text, arquivo_url text)
language sql stable security definer set search_path = public as $$
  select m.id, m.nome, m.categoria, m.arquivo_url
  from materiais m
  join materiais_compartilhados mc on mc.material_id = m.id
  join restaurantes r on r.id = mc.restaurante_id
  where r.token = p_token
$$;
grant execute on function rpc_materiais_restaurante(text) to anon, authenticated;

-- ---------- LOTE E: notificações (avisar chef quando diretor mexe na conta dele) ----------
create table if not exists notificacoes (
  id              uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references perfis(id) on delete cascade,
  titulo          text not null,
  mensagem        text,
  lida            boolean not null default false,
  criado_em       timestamptz default now()
);
alter table notificacoes enable row level security;

drop policy if exists notif_self        on notificacoes;
drop policy if exists notif_self_update on notificacoes;
drop policy if exists notif_diretor     on notificacoes;
create policy notif_self        on notificacoes for select using (destinatario_id = auth.uid());
create policy notif_self_update on notificacoes for update using (destinatario_id = auth.uid()) with check (destinatario_id = auth.uid());
create policy notif_diretor     on notificacoes for all    using (sou_diretor()) with check (sou_diretor());

create or replace function notificar_chef_restaurante()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_dest uuid;
begin
  if new.chef_id is not null then
    select id into v_dest from perfis where chef_id = new.chef_id;
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

drop trigger if exists trg_notificar_restaurante on restaurantes;
create trigger trg_notificar_restaurante
  after insert or update on restaurantes
  for each row execute function notificar_chef_restaurante();

-- =====================================================================
--  PRONTO. Depois de rodar, recarregue o app (Ctrl+Shift+R).
-- =====================================================================
