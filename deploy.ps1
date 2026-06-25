# Deploy para GitHub Pages
# Pré-requisito: repositório já criado no GitHub (ver README sobre qual conta usar).
# Uso: .\deploy.ps1

$env:VITE_BASE = '/instituto-cesar-santos/'
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build falhou"; exit 1 }

npx gh-pages -d dist `
  -u "atiliorod-jpg <atiliorod-jpg@users.noreply.github.com>" `
  -r "https://github.com/atiliorod-jpg/instituto-cesar-santos.git"
