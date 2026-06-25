// jsPDF é carregado sob demanda (import dinâmico) para não pesar o bundle inicial.

// Paleta (RGB)
const PRETO = [35, 35, 35]
const DOURADO = [201, 162, 75]
const CINZA = [110, 110, 110]

// Carrega o logo do Instituto como dataURL (para embutir no PDF)
async function carregarLogo() {
  try {
    const url = `${import.meta.env.BASE_URL}logo-ics.png`
    const resp = await fetch(url)
    const blob = await resp.blob()
    return await new Promise((res) => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result)
      fr.onerror = () => res(null)
      fr.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// Gera e baixa o PDF de uma receita no padrão do Instituto.
export async function gerarReceitaPdf(r) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const M = 18 // margem
  const maxW = W - M * 2
  let y = 16

  // Logo centralizado
  const logo = await carregarLogo()
  if (logo) {
    const lw = 34, lh = 34
    try { doc.addImage(logo, 'PNG', (W - lw) / 2, y, lw, lh) } catch { /* ignore */ }
    y += lh + 4
  } else {
    y += 4
  }

  // Categoria (dourado, caixa alta)
  if (r.categoria) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...DOURADO)
    doc.text((r.categoria || '').toUpperCase(), W / 2, y, { align: 'center' })
    y += 6
  }

  // Título (serif)
  doc.setFont('times', 'bold'); doc.setFontSize(20); doc.setTextColor(...PRETO)
  doc.splitTextToSize(r.titulo || 'Receita', maxW).forEach((ln) => {
    doc.text(ln, W / 2, y, { align: 'center' }); y += 9
  })

  // Autor
  const autor = r.chefs?.nome || r.autor
  if (autor) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...CINZA)
    doc.text(`por ${autor}`, W / 2, y, { align: 'center' }); y += 7
  }

  // linha dourada
  y += 2
  doc.setDrawColor(...DOURADO); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 8

  const novaPaginaSeNecessario = (alturaPrevista) => {
    if (y + alturaPrevista > 282) { doc.addPage(); y = 18 }
  }

  const secao = (titulo) => {
    novaPaginaSeNecessario(14)
    doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(...PRETO)
    doc.text(titulo, M, y); y += 7
  }

  const linhas = (texto, { bulletSub } = {}) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...PRETO)
    ;(texto || '').split('\n').forEach((raw) => {
      const t = raw.trim()
      if (!t) return
      const isSub = t.startsWith('—')
      const limpo = isSub ? t.replace(/^—\s*|\s*—$/g, '') : t
      const prefixo = isSub ? '' : (bulletSub ? '•  ' : '')
      const wrapped = doc.splitTextToSize(prefixo + limpo, maxW)
      novaPaginaSeNecessario(wrapped.length * 5 + 2)
      if (isSub) { doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO); y += 1 }
      else { doc.setFont('helvetica', 'normal') }
      wrapped.forEach((ln) => { doc.text(ln, M, y); y += 5 })
      if (isSub) y += 1
    })
  }

  if (r.descricao) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(10.5); doc.setTextColor(...CINZA)
    doc.splitTextToSize(r.descricao, maxW).forEach((ln) => { novaPaginaSeNecessario(6); doc.text(ln, M, y); y += 5 })
    y += 4
  }

  if (r.ingredientes) { secao('Ingredientes'); linhas(r.ingredientes, { bulletSub: true }); y += 4 }
  if (r.modo_preparo) { secao('Modo de preparo'); linhas(r.modo_preparo); }

  // Rodapé em todas as páginas
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...CINZA)
    doc.text('Instituto César Santos · Gastronomia Brasileira', W / 2, 290, { align: 'center' })
  }

  const nomeArq = (r.titulo || 'receita').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  doc.save(`${nomeArq}.pdf`)
}
