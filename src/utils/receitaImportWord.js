// Importa uma receita a partir de um .docx preenchido pelo chef e tenta separar
// título / ingredientes / modo de preparo, no padrão das receitas do acervo
// (sem campos de precificação). Heurística por cabeçalhos de seção — se não
// encontrar os cabeçalhos, devolve tudo em "ingredientes" e avisa o chef a revisar.
import mammoth from 'mammoth'

const RE_ING = /^ingredientes\s*:?$/i
const RE_PREPARO = /^(modo\s+(de|e)\s+preparo|preparo|modo\s+de\s+fazer)\s*:?$/i
const RE_OBS = /^(observa[çc][õo]es|conserva[çc][ãa]o)\s*:?$/i

export async function parseReceitaWord(file) {
  const buffer = await file.arrayBuffer()
  const { value: texto } = await mammoth.extractRawText({ arrayBuffer: buffer })
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (linhas.length === 0) {
    return { titulo: '', ingredientes: '', modo_preparo: '', completo: false }
  }

  const idxIng = linhas.findIndex((l) => RE_ING.test(l))
  const idxPreparo = linhas.findIndex((l) => RE_PREPARO.test(l))
  const idxObs = linhas.findIndex((l) => RE_OBS.test(l))

  // Título: primeira linha, a menos que ela própria seja um cabeçalho de seção.
  const titulo = !RE_ING.test(linhas[0]) && !RE_PREPARO.test(linhas[0]) ? linhas[0] : ''

  if (idxPreparo === -1) {
    // Não achou cabeçalho de preparo: devolve tudo (menos o título) em ingredientes,
    // para o chef revisar e separar manualmente.
    const resto = linhas.slice(titulo ? 1 : 0)
    return { titulo, ingredientes: resto.join('\n'), modo_preparo: '', completo: false }
  }

  const inicioIng = idxIng !== -1 ? idxIng + 1 : (titulo ? 1 : 0)
  const fimPreparo = idxObs !== -1 && idxObs > idxPreparo ? idxObs : linhas.length

  const ingredientes = linhas.slice(inicioIng, idxPreparo).join('\n')
  const modo_preparo = linhas.slice(idxPreparo + 1, fimPreparo).join('\n')
  const observacoes = idxObs !== -1 ? linhas.slice(idxObs + 1).join('\n') : ''

  return { titulo, ingredientes, modo_preparo, observacoes, completo: true }
}
