// Opções compartilhadas dos módulos de gestão (Bloco B).

export const STATUS_CIDADE = [
  'Planejamento',
  'Prospecção ativa',
  'Distribuição',
  'Em andamento',
  'Em finalização',
  'Concluída',
  'Arquivada',
]

export const STATUS_RESTAURANTE = [
  { v: 'prospect', l: 'Prospect' },
  { v: 'distribuido', l: 'Distribuído' },
  { v: 'agendado', l: 'Agendado' },
  { v: 'realizado', l: 'Realizado' },
  { v: 'concluido', l: 'Concluído' },
  { v: 'inativo', l: 'Inativo' },
]

export function labelStatusRestaurante(v) {
  return (STATUS_RESTAURANTE.find((s) => s.v === v) || {}).l || v
}

export const ORIGENS = [
  'Prospecção do Instituto',
  'Prefeitura',
  'Secretaria Municipal',
  'Parceiro institucional',
  'Associação comercial',
  'Indicação',
  'Evento',
  'Cadastro direto do restaurante',
  'Inserção manual',
  'Importação de planilha',
  'Outro',
]

export const TIPOS_ESTAB = [
  'Restaurante',
  'Restaurante regional',
  'Bar e petiscaria',
  'Bistrô',
  'Confeitaria',
  'Lanchonete',
  'Pizzaria',
  'Cafeteria',
  'Outro',
]
