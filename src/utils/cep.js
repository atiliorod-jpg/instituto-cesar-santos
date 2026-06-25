// Busca endereço pelo CEP via ViaCEP (gratuito, sem chave). Usado para autopreencher
// o endereço no cadastro de restaurante/prospecção.
export function limparCep(cep) {
  return (cep || '').replace(/\D/g, '')
}

export function fmtCep(cep) {
  const d = limparCep(cep)
  if (d.length !== 8) return cep || ''
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export async function buscarCep(cep) {
  const d = limparCep(cep)
  if (d.length !== 8) return { erro: 'CEP precisa ter 8 dígitos.' }
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`)
    const data = await resp.json()
    if (data.erro) return { erro: 'CEP não encontrado.' }
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    }
  } catch {
    return { erro: 'Não foi possível buscar o CEP agora.' }
  }
}

// Monta uma linha de endereço a partir do resultado do ViaCEP + número informado à mão
export function montarEndereco({ logradouro, bairro, localidade, uf }, numero) {
  const rua = [logradouro, numero].filter(Boolean).join(', ')
  return [rua, bairro, localidade && uf ? `${localidade}/${uf}` : localidade].filter(Boolean).join(' - ')
}
