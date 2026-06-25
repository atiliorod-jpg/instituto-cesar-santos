# Instituto César Santos — app de gestão (protótipo)

Protótipo clicável do app de gestão de consultorias gastronômicas do Instituto César Santos da Gastronomia Brasileira (ICSGB), em Olinda/PE.

## Status: Fase 1 — protótipo sem backend real

Este app **não tem servidor, banco de dados ou autenticação real**. Todos os dados (restaurantes, agendamentos, fotos, materiais) são fictícios e ficam salvos só no `localStorage` do navegador onde você abrir o app — ou seja, cada pessoa que abrir vê/edita sua própria cópia dos dados, sem sincronizar com ninguém.

O login é um **seletor de perfil** (escolher "sou o Luciano", "sou o chef Fulano", etc.), não um login de verdade — qualquer pessoa pode escolher qualquer perfil.

Isso serve para validar o fluxo e o design com a equipe antes de investir em um backend de verdade (Fase 2, com Supabase — ver conversa com o desenvolvedor para detalhes de custo e arquitetura).

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview   # testar o build localmente
```

## Estrutura

- `src/data/` — dados de exemplo (equipe, chefs, restaurantes, agendamentos, materiais)
- `src/store/` — `SessionContext` (perfil ativo) e `DataContext` (dados mutáveis + regras de privacidade)
- `src/pages/` — uma tela por arquivo, organizadas por perfil (Luciano, Chef, Captação, Cliente)
- `src/components/` — componentes de UI reutilizáveis (Layout, NavBar, Badge, Card, ícones)

## Logo

O logo oficial (enviado em PNG numa conversa) ainda não está salvo em disco neste projeto. `src/components/Logo.jsx` usa um placeholder tipográfico (texto + ícone de garfo) até o arquivo real ser fornecido.
