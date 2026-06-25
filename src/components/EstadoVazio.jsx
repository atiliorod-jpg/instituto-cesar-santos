// Mostra carregando / aviso de configuração / vazio de forma consistente.
// Retorna null quando há dados (aí a página renderiza o conteúdo normalmente).
export default function EstadoVazio({ carregando, erro, vazio, mensagemVazio = 'Nada por aqui ainda.' }) {
  if (carregando) {
    return <p className="text-sm text-ics-cinza py-8 text-center">Carregando…</p>
  }
  // Sem banco conectado ainda: pro público mostramos uma mensagem amigável de "em breve".
  if (erro === 'nao-configurado') {
    return <p className="text-sm text-ics-cinza py-8 text-center">{mensagemVazio}</p>
  }
  if (erro) {
    return <p className="text-sm text-red-600 py-8 text-center">Erro ao carregar: {erro}</p>
  }
  if (vazio) {
    return <p className="text-sm text-ics-cinza py-8 text-center">{mensagemVazio}</p>
  }
  return null
}
