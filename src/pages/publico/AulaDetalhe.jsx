import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import Foto from '../../components/Foto.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { fmtDataLonga } from '../../utils/formatters.js'
import { embedUrl } from '../../utils/midia.js'
import { exAulaById } from '../../data/exemplos.js'

export default function AulaDetalhe() {
  const { id } = useParams()
  const q = useQuery(
    () => supabase.from('aulas').select('*, chefs(id,nome,slug,foto_url,bio), receitas(id,titulo,foto_url,categoria)').eq('id', id).maybeSingle(),
    [id]
  )
  const data = q.configurado ? q.data : exAulaById(id)
  const carregando = q.configurado && q.carregando
  const erro = q.configurado ? q.erro : null

  const embed = data ? embedUrl(data.video_url) : null

  return (
    <PublicLayout voltar={true}>
      <EstadoVazio carregando={carregando} erro={erro} vazio={!carregando && !data} mensagemVazio="Aula não encontrada." />
      {data && (
        <article>
          <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-1">
            {data.tipo === 'curso' ? 'Curso' : 'Aula show'}
          </p>
          <h1 className="font-title text-2xl font-semibold mb-2">{data.titulo}</h1>
          <p className="text-sm text-ics-cinza mb-5">
            {[data.cidade, data.local, data.data && fmtDataLonga(data.data), data.hora].filter(Boolean).join(' · ')}
          </p>

          {embed && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden mb-5 bg-black">
              <iframe src={embed} title={data.titulo} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}

          {data.descricao && <p className="text-sm leading-relaxed text-ics-preto/90 mb-6">{data.descricao}</p>}

          {data.chefs && (
            <Link to={`/equipe/${data.chefs.slug || data.chefs.id}`} className="block bg-white rounded-2xl border border-black/5 overflow-hidden mb-5 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 p-3">
                {data.chefs.foto_url ? (
                  <img src={data.chefs.foto_url} alt={data.chefs.nome} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-ics-preto text-white flex items-center justify-center font-title flex-shrink-0">
                    {data.chefs.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-ics-cinza">Chef</p>
                  <p className="font-semibold">{data.chefs.nome}</p>
                  {data.chefs.bio && <p className="text-xs text-ics-cinza line-clamp-2">{data.chefs.bio}</p>}
                </div>
              </div>
            </Link>
          )}

          {!data.chefs && data.chef_nome && (
            <div className="bg-white rounded-2xl border border-black/5 p-3 mb-5">
              <p className="text-xs text-ics-cinza">Chef responsável</p>
              <p className="font-semibold">{data.chef_nome}</p>
            </div>
          )}

          {data.receitas && (
            <>
              <h2 className="font-title text-lg font-semibold mb-2">Ficha da receita</h2>
              <Link to={`/receitas/${data.receitas.id}`} className="block bg-white rounded-2xl border border-black/5 overflow-hidden active:scale-[0.98] transition-transform">
                <Foto src={data.receitas.foto_url} alt={data.receitas.titulo} aspect="aspect-[16/9]" />
                <div className="p-3">
                  {data.receitas.categoria && <p className="text-xs text-ics-cinza">{data.receitas.categoria}</p>}
                  <p className="font-semibold">{data.receitas.titulo}</p>
                </div>
              </Link>
            </>
          )}
        </article>
      )}
    </PublicLayout>
  )
}
