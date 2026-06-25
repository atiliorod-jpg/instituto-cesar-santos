// Gera um modelo (.docx) de ficha técnica de receita para o chef preencher offline no Word
// e enviar de volta ao Instituto. `docx` é carregado sob demanda (import dinâmico) para não
// pesar o bundle inicial — mesmo padrão usado para o jsPDF em receitaPdf.js.

const DOURADO = 'C9A24B'
const PRETO = '232323'
const CINZA = '6E6E6E'

export async function gerarFichaTecnicaModelo() {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  } = await import('docx')

  function linhaCampo(label) {
    return new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, color: PRETO }),
        new TextRun({ text: '_'.repeat(46), color: CINZA }),
      ],
    })
  }

  function tituloSecao(texto) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 140 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DOURADO, space: 4 } },
      children: [new TextRun({ text: texto, bold: true, color: PRETO })],
    })
  }

  function celula(texto, { header = false, width } = {}) {
    return new TableCell({
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      shading: header ? { type: ShadingType.CLEAR, fill: PRETO } : undefined,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [
        new Paragraph({
          children: [new TextRun({ text: texto, bold: header, color: header ? 'FFFFFF' : PRETO, size: header ? 19 : 20 })],
        }),
      ],
    })
  }

  function linhaVazia(cols) {
    return new TableRow({ children: cols.map(() => celula(' ')) })
  }

  const colunas = ['Item', 'Quantidade', 'Unidade', 'Custo unitário (R$)', 'Custo total (R$)']
  const larguras = [34, 16, 16, 17, 17]

  const tabelaIngredientes = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: colunas.map((c, i) => celula(c, { header: true, width: larguras[i] })) }),
      ...Array.from({ length: 10 }, () => linhaVazia(colunas)),
      new TableRow({
        children: [
          celula('Custo total da receita', { header: true, width: 68 }),
          celula(' ', { width: 16 }),
          celula(' ', { width: 16 }),
        ],
      }),
    ],
  })

  const passos = Array.from({ length: 8 }, (_, i) => new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text: `${i + 1}. `, bold: true, color: DOURADO }), new TextRun({ text: '_'.repeat(70), color: CINZA })],
  }))

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: 'INSTITUTO CÉSAR SANTOS', bold: true, color: DOURADO, size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Ficha Técnica de Receita', bold: true, color: PRETO })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 280 },
          children: [new TextRun({
            text: 'Modelo para o chef preencher e enviar de volta ao Instituto. Campos em branco/linhas tracejadas são para preencher.',
            italics: true, color: CINZA, size: 19,
          })],
        }),

        tituloSecao('Identificação'),
        linhaCampo('Nome do prato'),
        linhaCampo('Categoria (Entradas / Pratos principais / Acompanhamentos / Sobremesas / Bebidas)'),
        linhaCampo('Chef responsável'),
        linhaCampo('Rendimento (porções)'),
        linhaCampo('Tempo de preparo'),

        tituloSecao('Ingredientes e custo'),
        tabelaIngredientes,

        tituloSecao('Modo de preparo'),
        ...passos,

        tituloSecao('Precificação'),
        linhaCampo('Custo total dos ingredientes (R$)'),
        linhaCampo('Preço de venda sugerido (R$)'),
        linhaCampo('Margem (%)'),

        tituloSecao('Observações / conservação'),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '_'.repeat(80), color: CINZA })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '_'.repeat(80), color: CINZA })] }),
        new Paragraph({ spacing: { after: 280 }, children: [new TextRun({ text: '_'.repeat(80), color: CINZA })] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Depois de preenchida, envie esta ficha para o Instituto César Santos.', italics: true, color: CINZA, size: 18 })],
        }),
      ],
    }],
  })

  return Packer.toBlob(doc)
}

export async function baixarFichaTecnicaModelo() {
  const blob = await gerarFichaTecnicaModelo()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Ficha-Tecnica-Modelo-ICS.docx'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
