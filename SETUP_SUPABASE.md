# Setup do Supabase — Instituto César Santos

Passo a passo pra ligar o app a um banco de dados real. Leva ~10 minutos.

## 1. Criar o projeto

1. Acesse https://supabase.com e entre (pode usar a conta Google).
2. **New project** → escolha um nome (ex: `instituto-cesar-santos`), defina uma senha do banco (guarde) e a região **South America (São Paulo)**.
3. Espere ~2 min até o projeto ficar pronto.

## 2. Rodar o schema

1. No projeto, menu lateral → **SQL Editor** → **New query**.
2. Abra o arquivo `SUPABASE_SETUP.sql` (nesta pasta), copie **tudo** e cole no editor.
3. Clique em **Run**. Deve aparecer "Success".
4. Repita com `SUPABASE_SEED.sql` (cadastra os 12 chefs e as cidades).

## 3. Pegar as chaves e configurar o app

1. Menu lateral → **Project Settings** (engrenagem) → **API**.
2. Copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public** key (uma chave longa)
3. Nesta pasta, crie um arquivo chamado `.env.local` (copie de `.env.example`) e preencha:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=cole-a-chave-anon-aqui
   ```
4. **Me mande essas duas informações** (URL + anon key) que eu termino de ligar o app. A `anon key` é pública por natureza (vai no app), então pode compartilhar.

## 4. Login da equipe

1. Menu lateral → **Authentication** → **Providers** → confirme que **Email** está ligado.
   (Pra testar mais rápido, em **Providers → Email** você pode desligar "Confirm email".)
2. **Authentication → Users → Add user** → crie o usuário do Luciano (email + senha).
3. Copie o **UUID** do usuário criado e rode no SQL Editor:
   ```sql
   insert into perfis (id, nome, email, papel)
   values ('UUID-DO-LUCIANO', 'Luciano Roberto', 'email-do-luciano', 'diretor');
   ```
4. Os chefs, captação e clientes ganham conta do mesmo jeito (mude o `papel` e, no caso do chef, preencha `chef_id` com o id da linha dele na tabela `chefs`).

## 5. Vídeos das aulas

Os vídeos de aula show / curso ficam no **YouTube ou Vimeo** (pode ser "não listado").
No app, ao cadastrar a aula, é só colar o link — não precisa subir vídeo pro Supabase
(isso manteria o plano grátis por muito menos tempo).

---

### Sobre custos (resumo)
- **Supabase grátis**: 500 MB de banco, 1 GB de arquivos, 5 GB de tráfego/mês — sobra pra começar.
- **Plano pago** (se crescer): US$ 25/mês.
- **GitHub Pages** (hospedar o app): grátis.
- **Play Store**: taxa única de US$ 25 pra publicar.
