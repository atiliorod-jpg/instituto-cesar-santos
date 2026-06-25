// Gera um relatório completo (.docx) de uma cidade de atendimento, para o diretor
// baixar quando a cidade é finalizada. `docx` é carregado sob demanda (mesmo padrão
// da ficha técnica e do jsPDF) para não pesar o bundle inicial.
import { fmtDataLonga } from './formatters.js'
import { labelStatusRestaurante } from '../data/opcoes.js'

const DOURADO = 'C9A24B'
const PRETO = '232323'
const CINZA = '6E6E6E'

function dataISOcurta(iso) {
  // criado_em vem como timestamptz; pegamos só a parte da data.
  if (!iso) return '—'
  return fmtDataLonga(String(iso).slice(0, 10))
}

export async function gerarRelatorioCidade({ cidade, restaurantes = [], chefsPorId = {} }) {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  } = await import('docx')

  function tituloSecao(texto) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 140 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DOURADO, space: 4 } },
      children: [new TextRun({ text: texto, bold: true, color: PRETO })],
    })
  }

  function linhaInfo(label, valor) {
    return new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, color: PRETO }),
        new TextRun({ text: valor || '—', color: CINZA }),
      ],
    })
  }

  function celula(texto, { header = false, width } = {}) {
    return new TableCell({
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      shading: header ? { type: ShadingType.CLEAR, fill: PRETO } : undefined,
      margins: { top: 70, bottom: 70, left: 90, right: 90 },
      children: [new Paragraph({ children: [new TextRun({ text: texto ?? '', bold: header, color: header ? 'FFFFFF' : PRETO, size: header ? 18 : 19 })] })],
    })
  }

  const colunas = ['Restaurante', 'Tipo', 'Status', 'Chef', 'Prospectado em']
  const larguras = [28, 18, 16, 22, 16]
  const linhasRest = restaurantes.map((r) => new TableRow({
    children: [
      celula(r.nome, { width: larguras[0] }),
      celula(r.tipo || '—', { width: larguras[1] }),
      celula(labelStatusRestaurante(r.status), { width: larguras[2] }),
      celula(r.chef_id ? (chefsPorId[r.chef_id] || '—') : '— não distribuído', { width: larguras[3] }),
      celula(dataISOcurta(r.criado_em), { width: larguras[4] }),
    ],
  }))

  const tabela = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: colunas.map((c, i) => celula(c, { header: true, width: larguras[i] })) }),
      ...(linhasRest.length ? linhasRest : [new TableRow({ children: [celula('Nenhum restaurante cadastrado.', { width: 100 })] })]),
    ],
  })

  // Resumo numérico
  const total = restaurantes.length
  const distribuidos = restaurantes.filter((r) => r.chef_id).length
  const concluidos = restaurantes.filter((r) => r.status === 'concluido' || r.status === 'realizado').length

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'INSTITUTO CÉSAR SANTOS', bold: true, color: DOURADO, size: 22 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: `Relatório da Cidade — ${cidade.nome}${cidade.estado ? '/' + cidade.estado : ''}`, bold: true, color: PRETO })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 }, children: [new TextRun({ text: `Emitido em ${fmtDataLonga(new Date().toISOString().slice(0, 10))}`, italics: true, color: CINZA, size: 18 })] }),

        tituloSecao('Resumo'),
        linhaInfo('Status atual', cidade.status),
        linhaInfo('Ano / ciclo', cidade.ano ? String(cidade.ano) : '—'),
        linhaInfo('Cidade cadastrada em', dataISOcurta(cidade.criado_em)),
        linhaInfo('Início do atendimento', cidade.data_inicio ? fmtDataLonga(cidade.data_inicio) : '—'),
        linhaInfo('Data limite', cidade.data_limite ? fmtDataLonga(cidade.data_limite) : '—'),
        linhaInfo('Total de restaurantes', String(total)),
        linhaInfo('Distribuídos a chefs', String(distribuidos)),
        linhaInfo('Atendidos / concluídos', String(concluidos)),

        tituloSecao('Restaurantes'),
        tabela,

        ...(cidade.observacoes ? [
          tituloSecao('Observações'),
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: cidade.observacoes, color: PRETO, size: 20 })] }),
        ] : []),

        new Paragraph({ spacing: { before: 360 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Instituto César Santos · Gastronomia Brasileira · Olinda, PE', italics: true, color: CINZA, size: 16 })] }),
      ],
    }],
  })

  return Packer.toBlob(doc)
}

export async function baixarRelatorioCidade(dados) {
  const blob = await gerarRelatorioCidade(dados)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const nomeArq = `Relatorio-${(dados.cidade.nome || 'cidade').replace(/[^\w]+/g, '-')}.docx`
  a.download = nomeArq
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
