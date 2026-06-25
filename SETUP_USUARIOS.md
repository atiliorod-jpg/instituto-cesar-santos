# Criar os logins da equipe (Supabase Auth)

Por segurança, **o sistema não cria contas nem senhas automaticamente** — você cria no painel do Supabase. Leva ~2 min por pessoa. Depois me passe os e-mails que eu vinculo os perfis (papéis) no banco.

## 1. Ativar o login por e-mail
1. Supabase → projeto **instituto-cesar-santos** → **Authentication** → **Providers**.
2. Confirme que **Email** está ligado.
3. Para testar mais rápido, em **Email** você pode **desligar "Confirm email"** (assim o login funciona sem o usuário precisar confirmar no e-mail).

## 2. Criar o acesso de administrador
1. **Authentication → Users → Add user** → crie o usuário admin com e-mail e senha.
2. Me mande o **e-mail** usado. Eu vinculo o perfil com papel **diretor** (controle total) no banco:
   ```sql
   insert into perfis (id, nome, email, papel)
   select id, 'Administração', email, 'diretor'
   from auth.users where email = 'SEU-EMAIL-ADMIN'
   on conflict (id) do update set papel = 'diretor';
   ```
   - **Observação de segurança (auditoria 25/06):** o acesso de diretor vem **só** do papel `diretor` no perfil — não existe mais "e-mail mágico" com acesso automático.

## 3. Criar o login do Luciano (Diretor — controle total)
1. **Authentication → Users → Add user** → e-mail e senha do Luciano.
2. Me mande o **e-mail** que você usou. Eu rodo no banco:
   ```sql
   insert into perfis (id, nome, email, papel)
   select id, 'Luciano Roberto', email, 'diretor'
   from auth.users where email = 'EMAIL-DO-LUCIANO'
   on conflict (id) do update set papel = 'diretor', nome = 'Luciano Roberto';
   ```
   (O papel **diretor** dá controle total — editar tudo, gerenciar contas, cidades, etc.)

## 4. Depois: chefs, captação e clientes
Quando as telas de cada perfil estiverem prontas, criamos os demais do mesmo jeito:
- **Chef**: papel `chef` + `chef_id` apontando para a linha dele na tabela `chefs`.
- **Captação (Josélia)**: papel `captacao`.
- **Restaurante**: papel `cliente` + `restaurante_id`.

Me avise os e-mails e eu faço os vínculos.

---

### Como testar o login
1. Abra o app → **Entrar** → use o e-mail/senha que você criou.
2. Você cai na **Área da equipe** com as permissões do seu papel.
3. O acesso fica salvo no banco — funciona em qualquer dispositivo, e persiste ao atualizar a página.
