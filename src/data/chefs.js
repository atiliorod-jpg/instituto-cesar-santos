export const CHEFS = [
  { id: 'c1', nome: 'Adriano Oliveira', iniciais: 'AO' },
  { id: 'c2', nome: 'Anna Corinna', iniciais: 'AC' },
  { id: 'c3', nome: 'Atílio Leite', iniciais: 'AL' },
  { id: 'c4', nome: 'Barbara Vieira', iniciais: 'BV' },
  { id: 'c5', nome: 'Carol Medeiros', iniciais: 'CM' },
  { id: 'c6', nome: 'César Bastos', iniciais: 'CB' },
  { id: 'c7', nome: 'George Luis', iniciais: 'GL' },
  { id: 'c8', nome: 'Heleno Junior', iniciais: 'HJ' },
  { id: 'c9', nome: 'Monique Bezerra', iniciais: 'MB' },
  { id: 'c10', nome: 'Rafhael Diniz', iniciais: 'RD' },
  { id: 'c11', nome: 'Raul Menezes', iniciais: 'RM' },
  { id: 'c12', nome: 'Rogério Ribeiro', iniciais: 'RR' },
  { id: 'c13', nome: 'Mardoneo Bernadino', iniciais: 'MB' },
]

export function chefById(id) {
  return CHEFS.find((c) => c.id === id) || null
}
