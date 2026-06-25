// Conteúdo de EXEMPLO (fictício) para a vitrine pública aparecer "viva"
// enquanto o Supabase não está conectado. Tudo aqui é placeholder e será
// substituído pelo conteúdo real cadastrado pelos chefs no banco.
import { CHEFS } from './chefs.js'

// Equipe: usa os chefs reais + especialidade/bio de exemplo
const ESPECIALIDADES = [
  'Cozinha regional', 'Confeitaria', 'Panificação', 'Cozinha contemporânea',
  'Carnes e brasa', 'Gastronomia afetiva', 'Cozinha do mar', 'Doçaria fina',
  'Cozinha vegetariana', 'Massas artesanais', 'Coquetelaria', 'Cozinha nordestina',
]

export const CHEFS_EX = CHEFS.map((c, i) => ({
  ...c,
  especialidade: ESPECIALIDADES[i % ESPECIALIDADES.length],
  foto_url: null,
  bio: `(Exemplo) ${c.nome} é chef consultor do Instituto César Santos, com atuação em ${ESPECIALIDADES[i % ESPECIALIDADES.length].toLowerCase()} e foco em valorizar os ingredientes de Pernambuco.`,
}))

export const RECEITAS_EX = [
  {
    id: 'rex1', chef_id: 'c3', titulo: '(Exemplo) Moqueca de banana-da-terra',
    slug: 'moqueca-banana', categoria: 'Prato principal', foto_url: null,
    descricao: 'Uma releitura vegetariana da moqueca, com banana-da-terra e leite de coco.',
    ingredientes: '2 bananas-da-terra\n200ml de leite de coco\n1 cebola\n1 tomate\nCoentro a gosto\nAzeite de dendê',
    modo_preparo: 'Refogue a cebola e o tomate, acrescente a banana em rodelas, o leite de coco e finalize com dendê e coentro.',
    tempo_preparo: '40 min', rendimento: '4 porções', publicada: true,
  },
  {
    id: 'rex2', chef_id: 'c5', titulo: '(Exemplo) Bolo de rolo tradicional',
    slug: 'bolo-de-rolo', categoria: 'Sobremesa', foto_url: null,
    descricao: 'O clássico pernambucano em camadas finíssimas de goiabada.',
    ingredientes: '5 ovos\n250g de manteiga\n250g de açúcar\n250g de farinha\nGoiabada cremosa',
    modo_preparo: 'Bata manteiga e açúcar, incorpore os ovos e a farinha. Asse camadas finas e enrole com goiabada.',
    tempo_preparo: '1h30', rendimento: '1 bolo', publicada: true,
  },
  {
    id: 'rex3', chef_id: 'c2', titulo: '(Exemplo) Caldinho de feijão verde',
    slug: 'caldinho-feijao-verde', categoria: 'Entrada', foto_url: null,
    descricao: 'Caldinho cremoso de feijão verde, ótimo para o couvert.',
    ingredientes: '2 xícaras de feijão verde\n1 cebola\nAlho\nBacon (opcional)\nCheiro-verde',
    modo_preparo: 'Cozinhe o feijão, bata, volte ao fogo com o refogado e ajuste o sal.',
    tempo_preparo: '50 min', rendimento: '6 porções', publicada: true,
  },
  {
    id: 'rex4', chef_id: 'c9', titulo: '(Exemplo) Cartola de banana',
    slug: 'cartola', categoria: 'Sobremesa', foto_url: null,
    descricao: 'Banana frita com queijo de coalho, canela e açúcar.',
    ingredientes: '2 bananas\nQueijo de coalho\nManteiga\nAçúcar e canela',
    modo_preparo: 'Frite as bananas na manteiga, disponha sobre o queijo grelhado e polvilhe açúcar com canela.',
    tempo_preparo: '15 min', rendimento: '2 porções', publicada: true,
  },
]

export const AULAS_EX = [
  {
    id: 'aex1', chef_id: 'c3', tipo: 'aula_show', titulo: '(Exemplo) Aula Show — Sabores da Banana-da-terra',
    cidade: 'Olinda', data: '2026-07-18', hora: '18h', local: 'Sítio Histórico de Olinda',
    descricao: 'Uma noite de gastronomia ao vivo explorando a versatilidade da banana-da-terra na cozinha pernambucana.',
    video_url: '', receita_id: 'rex1', publicada: true,
  },
  {
    id: 'aex2', chef_id: 'c5', tipo: 'curso', titulo: '(Exemplo) Curso — Confeitaria Pernambucana',
    cidade: 'Recife', data: '2026-08-02', hora: '14h', local: 'Sede do Instituto',
    descricao: 'Curso intensivo de doces regionais, do bolo de rolo à cartola.',
    video_url: '', receita_id: 'rex2', publicada: true,
  },
]

export function exReceitaById(id) {
  const r = RECEITAS_EX.find((x) => x.id === id)
  if (!r) return null
  return { ...r, chefs: CHEFS_EX.find((c) => c.id === r.chef_id) || null }
}

export function exAulaById(id) {
  const a = AULAS_EX.find((x) => x.id === id)
  if (!a) return null
  return {
    ...a,
    chefs: CHEFS_EX.find((c) => c.id === a.chef_id) || null,
    receitas: a.receita_id ? RECEITAS_EX.find((r) => r.id === a.receita_id) || null : null,
  }
}

export function exChefBySlug(slug) {
  return CHEFS_EX.find((c) => c.slug === slug || c.id === slug) || null
}

export function exReceitasDoChef(chefId) {
  return RECEITAS_EX.filter((r) => r.chef_id === chefId)
}
