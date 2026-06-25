const MAPA = {
  realizado: { className: 'badge-green', label: 'Realizado' },
  agendado: { className: 'badge-gold', label: 'Agendado' },
  cancelado: { className: 'badge-red', label: 'Cancelado' },
  prospect: { className: 'badge-grey', label: 'Prospect' },
  cliente: { className: 'badge-gold', label: 'Cliente' },
  inativo: { className: 'badge-grey', label: 'Inativo' },
  compartilhada: { className: 'badge-gold', label: 'Compartilhada' },
  interna: { className: 'badge-grey', label: 'Uso interno' },
}

export function statusBadge(status) {
  return MAPA[status] || { className: 'badge-grey', label: status || '—' }
}
