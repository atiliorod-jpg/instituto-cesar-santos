const EVENTO = 'ics-toast'

export function showToast(mensagem, icone = '✓') {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { mensagem, icone, id: Date.now() } }))
}

export function ouvirToast(callback) {
  const handler = (e) => callback(e.detail)
  window.addEventListener(EVENTO, handler)
  return () => window.removeEventListener(EVENTO, handler)
}
