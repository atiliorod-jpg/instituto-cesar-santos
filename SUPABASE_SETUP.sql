-- =====================================================================
--  INSTITUTO CÉSAR SANTOS — Configuração do banco no Supabase
--  Cole este arquivo INTEIRO em: Supabase → SQL Editor → New query → Run.
--  É seguro rodar mais de uma vez (usa IF NOT EXISTS / DROP POLICY IF EXISTS).
--
--  Modelo:
--   LADO PÚBLICO (qualquer um lê, sem login): chefs, receitas, aulas
--     -> só aparece o que estiver com publicado = true
--   ÁREA DA EQUIPE (precisa login): cidades, restaurantes, agendamentos,
--     consultoria (notas privadas, relatório do cliente, fotos), materiais
--
--  Papéis (perfis.papel): 'diretor' | 'chef' | 'captacao' | 'cliente'
--   - diretor  (Luciano): cria cidades, cadastra restaurantes, distribui aos chefs
--   - chef               : recebe restaurantes, agenda e documenta consultorias;
--                          publica suas receitas e aulas
--   - captacao (Josélia) : registra prospects (restaurantes) nas cidades
--   - cliente            : o restaurante; vê seu relatório, fotos e materiais
-- =====================================================================

-- E-mail do super-admin (quem mantém o app). Tem acesso total mesmo sem perfil.
-- Troque se necessário (precisa bater com o login usado no painel).
--   -> usado em sou_diretor() abaixo via auth.jwt() ->> 'email'

-- =====================================================================
--  EXTENSÕES
-- =====================================================================
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- =====================================================================
--  TABELAS — CONTEÚDO PÚBLICO
-- =====================================================================

-- Chefs do Instituto (perfil público + usado na distribuição de restaurantes)
create table if not exists chefs (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text unique,
  iniciais      text,
  especialidade text,
  cidade_base   text,
  foto_url      text,
  bio           text,
  ativo         boolean not null default true,
  ordem         int default 0,
  criado_em     timestamptz default now()
);

-- Campos usados no editor de Equipe & Bios (CMS) — cargo exibido na vitrine, destaque = aparece em primeiro/maior
alter table chefs add column if not exists cargo    text;
alter table chefs add column if not exists destaque boolean not null default false;
alter table chefs add column if not exists whatsapp text;   -- contato direto (wa.me) no perfil/lista

-- Receitas publicadas pelos chefs (vitrine pública)
create table if not exists receitas (
  id            uuid primary key default gen_random_uuid(),
  chef_id       uuid references chefs(id) on delete set null,
  titulo        text not null,
  slug          text unique,
  categoria     text,
  foto_url      text,
  descricao     text,
  ingredientes  text,          -- texto livre, um por linha
  modo_preparo  text,
  tempo_preparo text,
  rendimento    text,
  publicada     boolean not null default false,
  criado_em     timestamptz default now()
);

-- Autor convidado (receita do acervo sem chef vinculado da equipe)
alter table receitas add column if not exists autor text;

-- Aulas show e cursos (vídeo hospedado no YouTube/Vimeo — guardamos só o link)
create table if not exists aulas (
  id          uuid primary key default gen_random_uuid(),
  chef_id     uuid references chefs(id) on delete set null,
  tipo        text not null default 'aula_show' check (tipo in ('aula_show','curso')),
  titulo      text not null,
  cidade      text,
  data        date,
  hora        text,
  local       text,
  descricao   text,
  video_url   text,            -- link do YouTube/Vimeo
  receita_id  uuid references receitas(id) on delete set null,
  publicada   boolean not null default false,
  criado_em   timestamptz default now()
);

-- Chef responsável digitado livre (aula ministrada por quem não é chef da equipe)
alter table aulas add column if not exists chef_nome text;

-- =====================================================================
--  TABELAS — ÁREA DA EQUIPE
-- =====================================================================

-- Perfis ligados ao login (auth.users). chef_id/restaurante_id conforme o papel.
create table if not exists perfis (
  id             uuid primary key references auth.users(id) on delete cascade,
  nome           text,
  email          text,
  papel          text not null default 'chef' check (papel in ('diretor','chef','captacao','cliente')),
  chef_id        uuid references chefs(id) on delete set null,
  restaurante_id uuid,
  criado_em      timestamptz default now()
);

-- Cidades de atendimento (Luciano cria; restaurantes ficam "dentro" delas)
create table if not exists cidades (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  estado    text default 'PE',
  criado_em timestamptz default now()
);

-- Campos do módulo Cidades & Restaurantes (status do ciclo, datas, observações)
alter table cidades add column if not exists status      text not null default 'Planejamento';
alter table cidades add column if not exists data_inicio date;
alter table cidades add column if not exists data_limite date;
alter table cidades add column if not exists observacoes text;
alter table cidades add column if not exists ano         int;   -- ciclo anual (renovação); contagem recomeça por ano
update cidades set ano = extract(year from criado_em)::int where ano is null;

-- Restaurantes prospectados / clientes. chef_id = chef a quem foi distribuído.
create table if not exists restaurantes (
  id           uuid primary key default gen_random_uuid(),
  cidade_id    uuid references cidades(id) on delete set null,
  nome         text not null,
  tipo         text,
  status       text not null default 'prospect',
  responsavel  text,
  contato      text,
  observacoes  text,
  chef_id      uuid references chefs(id) on delete set null,
  captado_por  uuid references perfis(id) on delete set null,
  criado_em    timestamptz default now()
);

-- Campos adicionais usados no cadastro (endereço/documento/origem do prospect/CEP p/ autopreenchimento)
alter table restaurantes add column if not exists origem    text;
alter table restaurantes add column if not exists endereco  text;
alter table restaurantes add column if not exists cep       text;
alter table restaurantes add column if not exists cnpj      text;
alter table restaurantes add column if not exists cpf       text;

-- Token único do link público do restaurante (.../r/<token>) — nasce já na prospecção.
alter table restaurantes add column if not exists token text unique
  default encode(gen_random_bytes(16), 'hex');
update restaurantes set token = encode(gen_random_bytes(16), 'hex') where token is null;

-- Status real do ciclo (prospecção -> distribuição -> consultoria), usado em AreaCidadeDetalhe.jsx.
-- Substitui o check antigo ('prospect','cliente','inativo') que ficou desatualizado em relação à UI.
alter table restaurantes drop constraint if exists restaurantes_status_check;
alter table restaurantes add constraint restaurantes_status_check
  check (status in ('prospect','distribuido','agendado','realizado','concluido','inativo'));

-- FK de perfis.restaurante_id (criada agora que restaurantes existe)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'perfis_restaurante_fk') then
    alter table perfis
      add constraint perfis_restaurante_fk
      foreign key (restaurante_id) references restaurantes(id) on delete set null;
  end if;
end $$;

-- Agendamentos de consultoria (criados pelo CHEF após combinar via WhatsApp)
create table if not exists agendamentos (
  id             uuid primary key default gen_random_uuid(),
  restaurante_id uuid not null references restaurantes(id) on delete cascade,
  chef_id        uuid references chefs(id) on delete set null,
  status         text not null default 'agendado' check (status in ('agendado','realizado','cancelado')),
  dias           jsonb not null default '[]',   -- [{data, periodo, horas}]
  data_proximo   date,
  criado_em      timestamptz default now()
);

-- Anotações PRIVADAS da consultoria (só o chef dono + diretor veem)
create table if not exists consultoria_notas (
  agendamento_id uuid primary key references agendamentos(id) on delete cascade,
  texto          text,
  atualizado_em  timestamptz default now()
);

-- Relatório que o CLIENTE recebe (resumo simples)
create table if not exists consultoria_relatorios (
  agendamento_id uuid primary key references agendamentos(id) on delete cascade,
  texto          text,
  atualizado_em  timestamptz default now()
);

-- Fotos/vídeos da visita. tipo 'interna' = só chef+diretor | 'compartilhada' = cliente vê
create table if not exists consultoria_fotos (
  id             uuid primary key default gen_random_uuid(),
  agendamento_id uuid not null references agendamentos(id) on delete cascade,
  tipo           text not null check (tipo in ('interna','compartilhada')),
  storage_path   text,          -- caminho no bucket privado 'consultorias'
  label          text,
  criado_em      timestamptz default now()
);

-- Biblioteca de materiais (planilhas, modelos, etc.)
create table if not exists materiais (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipo          text,
  categoria     text,
  arquivo_url   text,
  personalizavel boolean default false,
  criado_em     timestamptz default now()
);

-- Conteúdo institucional editável pelo diretor (CMS simples chave→valor).
-- Ex.: 'sobre.missao', 'sobre.valores'… Lido publicamente; escrito só pelo diretor.
create table if not exists conteudo (
  chave         text primary key,
  valor         text,
  atualizado_em timestamptz default now()
);

-- Quais materiais foram compartilhados com quais restaurantes
create table if not exists materiais_compartilhados (
  material_id    uuid references materiais(id) on delete cascade,
  restaurante_id uuid references restaurantes(id) on delete cascade,
  criado_em      timestamptz default now(),
  primary key (material_id, restaurante_id)
);

-- Notificações simples (ex.: avisar o chef quando o diretor mexe na conta dele)
create table if not exists notificacoes (
  id              uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references perfis(id) on delete cascade,
  titulo          text not null,
  mensagem        text,
  lida            boolean not null default false,
  criado_em       timestamptz default now()
);

-- =====================================================================
--  FUNÇÕES AUXILIARES (evitam recursão de policy na própria tabela perfis)
-- =====================================================================
create or replace function meu_papel()
returns text language sql stable security definer set search_path = public as $$
  select papel from perfis where id = auth.uid()
$$;

create or replace function meu_chef_id()
returns uuid language sql stable security definer set search_path = public as $$
  select chef_id from perfis where id = auth.uid()
$$;

create or replace function meu_restaurante_id()
returns uuid language sql stable security definer set search_path = public as $$
  select restaurante_id from perfis where id = auth.uid()
$$;

-- Diretor = quem tem perfil papel='diretor'. (Sem exceção por e-mail fixo: o
-- super-admin já tem perfil 'diretor'; e-mail no JWT seria frágil se o cadastro
-- anônimo estivesse aberto. — endurecido na auditoria 25/06/2026.)
create or replace function sou_diretor()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select papel = 'diretor' from perfis where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
--  LINK ÚNICO DO RESTAURANTE — acesso público sem login via token
--  (RPC security definer: só devolve dados do restaurante cujo token bate
--  exatamente; não dá pra listar/varrer os demais por aqui.)
-- ---------------------------------------------------------------------
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

-- =====================================================================
--  RLS — liga em todas as tabelas
-- =====================================================================
alter table chefs                   enable row level security;
alter table receitas                enable row level security;
alter table aulas                   enable row level security;
alter table perfis                  enable row level security;
alter table cidades                 enable row level security;
alter table restaurantes            enable row level security;
alter table agendamentos            enable row level security;
alter table consultoria_notas       enable row level security;
alter table consultoria_relatorios  enable row level security;
alter table consultoria_fotos       enable row level security;
alter table materiais               enable row level security;
alter table materiais_compartilhados enable row level security;
alter table conteudo                enable row level security;
alter table notificacoes            enable row level security;

-- ---------------------------------------------------------------------
--  CONTEÚDO PÚBLICO — leitura liberada para todos (inclusive anônimos)
--  Escrita: diretor sempre; chef só no que é dele.
-- ---------------------------------------------------------------------

-- CHEFS: todos leem os ativos; diretor gerencia todos; chef edita o próprio cartão
drop policy if exists chefs_select_pub on chefs;
drop policy if exists chefs_diretor    on chefs;
drop policy if exists chefs_self_update on chefs;
create policy chefs_select_pub on chefs for select using (ativo or sou_diretor() or id = meu_chef_id());
create policy chefs_diretor    on chefs for all using (sou_diretor()) with check (sou_diretor());
create policy chefs_self_update on chefs for update using (id = meu_chef_id()) with check (id = meu_chef_id());

-- RECEITAS: todos leem publicadas; diretor tudo; chef gerencia as suas
drop policy if exists receitas_select_pub on receitas;
drop policy if exists receitas_diretor    on receitas;
drop policy if exists receitas_chef       on receitas;
create policy receitas_select_pub on receitas for select using (publicada or sou_diretor() or chef_id = meu_chef_id());
create policy receitas_diretor    on receitas for all using (sou_diretor()) with check (sou_diretor());
create policy receitas_chef       on receitas for all using (chef_id = meu_chef_id()) with check (chef_id = meu_chef_id());

-- AULAS: todos leem publicadas; diretor tudo; chef gerencia as suas
drop policy if exists aulas_select_pub on aulas;
drop policy if exists aulas_diretor    on aulas;
drop policy if exists aulas_chef       on aulas;
create policy aulas_select_pub on aulas for select using (publicada or sou_diretor() or chef_id = meu_chef_id());
create policy aulas_diretor    on aulas for all using (sou_diretor()) with check (sou_diretor());
create policy aulas_chef       on aulas for all using (chef_id = meu_chef_id()) with check (chef_id = meu_chef_id());

-- ---------------------------------------------------------------------
--  PERFIS
-- ---------------------------------------------------------------------
drop policy if exists perfis_self    on perfis;
drop policy if exists perfis_diretor on perfis;
drop policy if exists perfis_self_update on perfis;
-- cada um lê o próprio perfil; diretor lê todos
create policy perfis_self    on perfis for select using (id = auth.uid() or sou_diretor());
create policy perfis_diretor on perfis for all using (sou_diretor()) with check (sou_diretor());
-- edita só o próprio nome/email (NÃO troca o próprio papel — anti-autopromoção)
create policy perfis_self_update on perfis for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and papel = (select papel from perfis where id = auth.uid())
    and chef_id is not distinct from (select chef_id from perfis where id = auth.uid())
    and restaurante_id is not distinct from (select restaurante_id from perfis where id = auth.uid())
  );

-- ---------------------------------------------------------------------
--  CIDADES — equipe lê; só diretor cria/edita
-- ---------------------------------------------------------------------
drop policy if exists cidades_select on cidades;
drop policy if exists cidades_diretor on cidades;
create policy cidades_select  on cidades for select using (meu_papel() in ('diretor','chef','captacao','cliente'));
create policy cidades_diretor on cidades for all using (sou_diretor()) with check (sou_diretor());

-- ---------------------------------------------------------------------
--  RESTAURANTES
--   - diretor: tudo
--   - captacao: cria prospects e lê os que cadastrou
--   - chef: lê os restaurantes distribuídos a ele
--   - cliente: lê o próprio restaurante
-- ---------------------------------------------------------------------
drop policy if exists restaurantes_diretor   on restaurantes;
drop policy if exists restaurantes_captacao_ins on restaurantes;
drop policy if exists restaurantes_captacao_sel on restaurantes;
drop policy if exists restaurantes_chef      on restaurantes;
drop policy if exists restaurantes_cliente   on restaurantes;
create policy restaurantes_diretor on restaurantes for all using (sou_diretor()) with check (sou_diretor());
create policy restaurantes_captacao_ins on restaurantes for insert
  with check (meu_papel() = 'captacao' and captado_por = auth.uid());
create policy restaurantes_captacao_sel on restaurantes for select
  using (meu_papel() = 'captacao' and captado_por = auth.uid());
create policy restaurantes_chef on restaurantes for select
  using (chef_id = meu_chef_id());
create policy restaurantes_cliente on restaurantes for select
  using (id = meu_restaurante_id());

-- ---------------------------------------------------------------------
--  AGENDAMENTOS
--   - diretor: tudo
--   - chef: cria/edita/lê os seus
--   - cliente: lê os do próprio restaurante
-- ---------------------------------------------------------------------
drop policy if exists agendamentos_diretor  on agendamentos;
drop policy if exists agendamentos_chef     on agendamentos;
drop policy if exists agendamentos_cliente  on agendamentos;
create policy agendamentos_diretor on agendamentos for all using (sou_diretor()) with check (sou_diretor());
-- chef gerencia os seus — e o restaurante TEM que ser dele (anti-sequestro de restaurante alheio)
create policy agendamentos_chef    on agendamentos for all
  using (chef_id = meu_chef_id())
  with check (
    chef_id = meu_chef_id()
    and (select chef_id from restaurantes where id = restaurante_id) = meu_chef_id()
  );
create policy agendamentos_cliente on agendamentos for select
  using (restaurante_id = meu_restaurante_id());

-- Helpers para as tabelas filhas da consultoria
create or replace function chef_do_agendamento(p_ag uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select chef_id from agendamentos where id = p_ag
$$;
create or replace function restaurante_do_agendamento(p_ag uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select restaurante_id from agendamentos where id = p_ag
$$;

-- ---------------------------------------------------------------------
--  CONSULTORIA — NOTAS PRIVADAS  (só chef dono + diretor)
-- ---------------------------------------------------------------------
drop policy if exists notas_diretor on consultoria_notas;
drop policy if exists notas_chef    on consultoria_notas;
create policy notas_diretor on consultoria_notas for all using (sou_diretor()) with check (sou_diretor());
create policy notas_chef on consultoria_notas for all
  using (chef_do_agendamento(agendamento_id) = meu_chef_id())
  with check (chef_do_agendamento(agendamento_id) = meu_chef_id());

-- ---------------------------------------------------------------------
--  CONSULTORIA — RELATÓRIO DO CLIENTE  (chef/diretor editam; cliente lê)
-- ---------------------------------------------------------------------
drop policy if exists rel_diretor on consultoria_relatorios;
drop policy if exists rel_chef    on consultoria_relatorios;
drop policy if exists rel_cliente on consultoria_relatorios;
create policy rel_diretor on consultoria_relatorios for all using (sou_diretor()) with check (sou_diretor());
create policy rel_chef on consultoria_relatorios for all
  using (chef_do_agendamento(agendamento_id) = meu_chef_id())
  with check (chef_do_agendamento(agendamento_id) = meu_chef_id());
create policy rel_cliente on consultoria_relatorios for select
  using (restaurante_do_agendamento(agendamento_id) = meu_restaurante_id());

-- ---------------------------------------------------------------------
--  CONSULTORIA — FOTOS
--   internas: só chef dono + diretor | compartilhadas: cliente também lê
-- ---------------------------------------------------------------------
drop policy if exists fotos_diretor on consultoria_fotos;
drop policy if exists fotos_chef    on consultoria_fotos;
drop policy if exists fotos_cliente on consultoria_fotos;
create policy fotos_diretor on consultoria_fotos for all using (sou_diretor()) with check (sou_diretor());
create policy fotos_chef on consultoria_fotos for all
  using (chef_do_agendamento(agendamento_id) = meu_chef_id())
  with check (chef_do_agendamento(agendamento_id) = meu_chef_id());
create policy fotos_cliente on consultoria_fotos for select
  using (tipo = 'compartilhada' and restaurante_do_agendamento(agendamento_id) = meu_restaurante_id());

-- ---------------------------------------------------------------------
--  MATERIAIS
--   equipe (diretor/chef/captacao) lê todos; diretor gerencia;
--   cliente lê só os compartilhados com o seu restaurante
-- ---------------------------------------------------------------------
drop policy if exists materiais_equipe  on materiais;
drop policy if exists materiais_diretor on materiais;
drop policy if exists materiais_cliente on materiais;
create policy materiais_equipe  on materiais for select
  using (meu_papel() in ('diretor','chef','captacao'));
create policy materiais_diretor on materiais for all using (sou_diretor()) with check (sou_diretor());
create policy materiais_cliente on materiais for select
  using (id in (select material_id from materiais_compartilhados where restaurante_id = meu_restaurante_id()));

drop policy if exists mc_diretor on materiais_compartilhados;
drop policy if exists mc_chef    on materiais_compartilhados;
drop policy if exists mc_cliente on materiais_compartilhados;
create policy mc_diretor on materiais_compartilhados for all using (sou_diretor()) with check (sou_diretor());
-- chef compartilha material com restaurante que é dele
create policy mc_chef on materiais_compartilhados for all
  using ((select chef_id from restaurantes where id = restaurante_id) = meu_chef_id())
  with check ((select chef_id from restaurantes where id = restaurante_id) = meu_chef_id());
create policy mc_cliente on materiais_compartilhados for select
  using (restaurante_id = meu_restaurante_id());

-- ---------------------------------------------------------------------
--  CONTEÚDO INSTITUCIONAL (CMS) — todos leem; só diretor edita
-- ---------------------------------------------------------------------
drop policy if exists conteudo_select  on conteudo;
drop policy if exists conteudo_diretor on conteudo;
create policy conteudo_select  on conteudo for select using (true);
create policy conteudo_diretor on conteudo for all using (sou_diretor()) with check (sou_diretor());

-- ---------------------------------------------------------------------
--  NOTIFICAÇÕES — cada um lê/marca como lida as suas; diretor gerencia tudo
-- ---------------------------------------------------------------------
drop policy if exists notif_self        on notificacoes;
drop policy if exists notif_self_update on notificacoes;
drop policy if exists notif_diretor     on notificacoes;
create policy notif_self        on notificacoes for select using (destinatario_id = auth.uid());
create policy notif_self_update on notificacoes for update using (destinatario_id = auth.uid()) with check (destinatario_id = auth.uid());
create policy notif_diretor     on notificacoes for all    using (sou_diretor()) with check (sou_diretor());

-- Avisa o chef quando o diretor (ou outra pessoa) mexe num restaurante que já é dele
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

drop trigger if exists trg_notificar_restaurante on restaurantes;
create trigger trg_notificar_restaurante
  after insert or update on restaurantes
  for each row execute function notificar_chef_restaurante();

-- =====================================================================
--  STORAGE — buckets
--   'publico'      : fotos de chefs e receitas (leitura pública)
--   'consultorias' : fotos da visita (privado; acesso por URL assinada)
-- =====================================================================
insert into storage.buckets (id, name, public)
  values ('publico', 'publico', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('consultorias', 'consultorias', false)
  on conflict (id) do nothing;

-- Converte com segurança a 1ª pasta do caminho (= agendamento_id) em uuid.
create or replace function agendamento_uuid_safe(p text)
returns uuid language plpgsql immutable as $$
begin
  return p::uuid;
exception when others then
  return null;
end $$;

-- Bucket público: qualquer um lê; ESCRITA só equipe (evita defacement por cliente/conta solta)
drop policy if exists pub_read   on storage.objects;
drop policy if exists pub_write  on storage.objects;
create policy pub_read on storage.objects for select
  using (bucket_id = 'publico');
create policy pub_write on storage.objects for all
  using (bucket_id = 'publico' and meu_papel() in ('diretor','chef','captacao'))
  with check (bucket_id = 'publico' and meu_papel() in ('diretor','chef','captacao'));

-- Bucket de consultorias (privado): só diretor + chef DONO do agendamento.
-- Caminho de upload é '<agendamento_id>/<arquivo>', então a 1ª pasta identifica o dono.
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
--  PRONTO.
--  Próximos passos manuais no painel do Supabase:
--   1) Authentication → Providers → Email: deixe ligado (e desligue
--      "Confirm email" se quiser testar mais rápido).
--   2) Crie o usuário do Luciano em Authentication → Users, depois rode:
--        insert into perfis (id, nome, email, papel)
--        values ('<UUID-do-usuario>', 'Luciano Roberto', '<email>', 'diretor');
--   3) Cadastre os chefs na tabela `chefs` (o app também terá tela pra isso).
-- =====================================================================
