const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES_LONGOS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "23 jun"
export function fmtData(iso) {
  if (!iso) return ''
  const d = parseISO(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

// "23 de junho de 2026"
export function fmtDataLonga(iso) {
  if (!iso) return ''
  const d = parseISO(iso)
  return `${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} de ${d.getFullYear()}`
}

// "123.456.789-09" — formata um CPF (aceita só dígitos ou já formatado).
export function fmtCpf(cpf) {
  const d = (cpf || '').replace(/\D/g, '').slice(0, 11)
  if (d.length !== 11) return cpf || ''
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// "•••.•••.789-09" — LGPD: esconde os 6 primeiros dígitos.
export function mascararCpf(cpf) {
  const d = (cpf || '').replace(/\D/g, '').slice(0, 11)
  if (d.length !== 11) return cpf ? '•••' : ''
  return `•••.•••.${d.slice(6, 9)}-${d.slice(9)}`
}

// CPF visível conforme o papel: diretor vê completo; demais veem mascarado.
export function cpfPorPapel(cpf, papel) {
  if (!cpf) return ''
  return papel === 'diretor' ? fmtCpf(cpf) : mascararCpf(cpf)
}

// Link wa.me a partir de um telefone digitado (aceita com/sem DDI, máscara, etc).
// Assume Brasil (+55) quando o número não traz DDI. Devolve null se inválido.
export function linkWhatsapp(numero) {
  let d = (numero || '').replace(/\D/g, '')
  if (!d) return null
  if (d.length <= 11) d = '55' + d        // sem DDI -> assume Brasil
  return `https://wa.me/${d}`
}

// "(81) 99999-9999" — exibição amigável de um telefone brasileiro.
export function fmtTelefone(numero) {
  const d = (numero || '').replace(/\D/g, '').replace(/^55/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return numero || ''
}
