-- =====================================================================
--  INSTITUTO CÉSAR SANTOS — Dados iniciais (rodar DEPOIS do SUPABASE_SETUP.sql)
--  Cadastra os 12 chefs e as cidades de atendimento. Seguro rodar de novo.
-- =====================================================================

-- Chefs (foto_url e bio ficam em branco — preencher pelo app ou aqui depois)
insert into chefs (nome, slug, iniciais, ordem) values
  ('Adriano Oliveira', 'adriano-oliveira', 'AO', 1),
  ('Anna Corinna',     'anna-corinna',     'AC', 2),
  ('Atílio Leite',     'atilio-leite',     'AL', 3),
  ('Barbara Vieira',   'barbara-vieira',   'BV', 4),
  ('Carol Medeiros',   'carol-medeiros',   'CM', 5),
  ('César Bastos',     'cesar-bastos',     'CB', 6),
  ('George Luis',      'george-luis',      'GL', 7),
  ('Heleno Junior',    'heleno-junior',    'HJ', 8),
  ('Monique Bezerra',  'monique-bezerra',  'MB', 9),
  ('Rafhael Diniz',    'rafhael-diniz',    'RD', 10),
  ('Raul Menezes',     'raul-menezes',     'RM', 11),
  ('Rogério Ribeiro',  'rogerio-ribeiro',  'RR', 12),
  ('Mardoneo Bernadino', 'mardoneo-bernadino', 'MB', 13)
on conflict (slug) do nothing;

-- Cidades de atendimento (Pernambuco)
insert into cidades (nome, estado) values
  ('Olinda', 'PE'),
  ('Recife', 'PE'),
  ('Caruaru', 'PE'),
  ('Garanhuns', 'PE'),
  ('Petrolina', 'PE'),
  ('Jaboatão dos Guararapes', 'PE'),
  ('Ipojuca', 'PE'),
  ('Gravatá', 'PE')
on conflict do nothing;
