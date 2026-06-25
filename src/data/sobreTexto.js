// Conteúdo institucional do "Sobre o Instituto" (validado pelo administrador).
export const SOBRE_TEXTO_DRAFT = false

export const SOBRE = {
  apresentacao:
    'O Instituto César Santos da Gastronomia Brasileira (ICSGB) é dedicado ao desenvolvimento, à valorização e à preservação da gastronomia pernambucana e brasileira. Reúne chefs, consultores e parceiros em torno de um propósito comum: transformar a cozinha regional em ferramenta de desenvolvimento econômico, cultural e social.',
  missao:
    'Fortalecer e valorizar a gastronomia de Pernambuco e do Brasil — seus ingredientes, profissionais e estabelecimentos — por meio de consultorias, formação e projetos culturais e educacionais. ' +
    'O Instituto cultiva a valorização da cultura e dos ingredientes regionais, o respeito ao agricultor e à agricultura familiar, a excelência técnica e a profissionalização, construindo uma cozinha de identidade e de terroir, em rede com seus parceiros e com impacto social e econômico nas cidades atendidas. ' +
    'Esse trabalho ganha força em projetos como a parceria com o Sebrae-PE, que resgata e valoriza a culinária e o artesanato regionais, conectando produtores, cozinheiros e restaurantes e levando a cultura gastronômica pernambucana para dentro e fora do país.',
  lideranca:
    'Presidido pelo chef César Santos, embaixador da gastronomia pernambucana, e dirigido por Luciano Roberto.',
}

// Campos editáveis no CMS (chave no Supabase ↔ rótulo ↔ texto padrão de fallback).
export const CAMPOS_SOBRE = [
  { chave: 'sobre.apresentacao', label: 'Apresentação', padrao: SOBRE.apresentacao },
  { chave: 'sobre.missao', label: 'Missão', padrao: SOBRE.missao },
  { chave: 'sobre.lideranca', label: 'Liderança', padrao: SOBRE.lideranca },
]

// Mescla as linhas vindas do Supabase (chave→valor) sobre o texto padrão,
// devolvendo um objeto no mesmo formato de SOBRE.
export function montarSobre(linhas = []) {
  const m = Object.fromEntries(linhas.map((l) => [l.chave, l.valor]))
  const v = (chave, padrao) => (m[chave] != null && m[chave] !== '' ? m[chave] : padrao)
  return {
    apresentacao: v('sobre.apresentacao', SOBRE.apresentacao),
    missao: v('sobre.missao', SOBRE.missao),
    lideranca: v('sobre.lideranca', SOBRE.lideranca),
  }
}
