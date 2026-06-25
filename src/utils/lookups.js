import { CHEFS } from '../data/chefs.js'
import { MATERIAIS_SEED } from '../data/materiais.js'

// Lookups sobre dados estáticos (não mutam durante o uso do app).
// Lookups sobre dados mutáveis (restaurantes, agendamentos, fotos, materiais
// compartilhados) ficam em DataContext, porque dependem do estado vivo.

export function chefById(id) {
  return CHEFS.find((c) => c.id === id) || null
}

export function materialSeedById(id) {
  return MATERIAIS_SEED.find((m) => m.id === id) || null
}
