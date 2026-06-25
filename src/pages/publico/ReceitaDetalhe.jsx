import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import Foto from '../../components/Foto.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { exReceitaById } from '../../data/exemplos.js'
import { gerarReceitaPdf } from '../../utils/receitaPdf.js'
import { IconDownload } from '../../components/Icons.jsx'

export default function ReceitaDetalhe() {
  const { id } = useParams()
  const q = useQuery(
    () => supabase.from('receitas').select('*, chefs(id,nome,slug,foto_url)').eq('id', id).maybeSingle(),
    [id]
  )
  const data = q.configurado ? q.data : exReceitaById(id)
  const carregando = q.configurado && q.carregando
  const erro = q.configurado ? q.erro : null

  const [baixando, setBaixando] = useState(false)
  async function baixarPdf() {
    setBaixando(true)
    try { await gerarReceitaPdf(data) } finally { setBaixando(false) }
  }

  return (
    <PublicLayout voltar={true}>
      <EstadoVazio carregando={carregando} erro={erro} vazio={!carregando && !data} mensagemVazio="Receita não encontrada." />
      {data && (
        <article>
          <Foto src={data.foto_url} alt={data.titulo} aspect="aspect-[16/10]" className="rounded-2xl mb-4" />
          {data.categoria && <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-1">{data.categoria}</p>}
          <h1 className="font-title text-2xl font-semibold mb-2">{data.titulo}</h1>

          {data.chefs ? (
            <Link to={`/equipe/${data.chefs.slug || data.chefs.id}`} className="inline-flex items-center gap-2 text-sm text-ics-cinza mb-4">
              por <span className="font-medium text-ics-preto">{data.chefs.nome}</span>
            </Link>
          ) : (data.autor && (
            <p className="text-sm text-ics-cinza mb-4">por <span className="font-medium text-ics-preto">{data.autor}</span></p>
          ))}

          <button
            onClick={baixarPdf}
            disabled={baixando}
            className="inline-flex items-center gap-2 bg-ics-preto text-white text-sm font-semibold rounded-full px-4 py-2 mb-5 disabled:opacity-50"
          >
            <IconDownload width={17} height={17} />
            {baixando ? 'Gerando…' : 'Baixar receita em PDF'}
          </button>

          {data.descricao && <p className="text-sm leading-relaxed text-ics-preto/90 mb-5">{data.descricao}</p>}

          <div className="flex gap-4 text-sm text-ics-cinza mb-6">
            {data.tempo_preparo && <span>⏱ {data.tempo_preparo}</span>}
            {data.rendimento && <span>🍽 {data.rendimento}</span>}
          </div>

          {data.ingredientes && (
            <section className="mb-6">
              <h2 className="font-title text-lg font-semibold mb-2">Ingredientes</h2>
              <div className="text-sm leading-relaxed space-y-1">
                {data.ingredientes.split('\n').filter((l) => l.trim()).map((l, i) => {
                  const sub = l.trim().replace(/^—\s*|\s*—$/g, '')
                  return l.trim().startsWith('—')
                    ? <p key={i} className="font-semibold text-ics-preto mt-3">{sub}</p>
                    : <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-ics-dourado">{l}</p>
                })}
              </div>
            </section>
          )}

          {data.modo_preparo && (
            <section>
              <h2 className="font-title text-lg font-semibold mb-2">Modo de preparo</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-ics-preto/90">{data.modo_preparo}</p>
            </section>
          )}
        </article>
      )}
    </PublicLayout>
  )
}
