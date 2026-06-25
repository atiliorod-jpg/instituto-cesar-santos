import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import Foto from '../../components/Foto.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { exChefBySlug, exReceitasDoChef } from '../../data/exemplos.js'
import { linkWhatsapp } from '../../utils/formatters.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ChefDetalhe() {
  const { slug } = useParams()
  // a URL traz o slug; só se for um UUID consultamos por id (evita erro de tipo no Postgres)
  const chefQ = useQuery(
    () => supabase.from('chefs').select('*').eq(UUID_RE.test(slug) ? 'id' : 'slug', slug).maybeSingle(),
    [slug]
  )
  const chef = chefQ.configurado ? chefQ.data : exChefBySlug(slug)

  const receitasQ = useQuery(
    () => chef ? supabase.from('receitas').select('id,titulo,foto_url,categoria').eq('chef_id', chef.id).eq('publicada', true) : Promise.resolve({ data: [] }),
    [chef?.id]
  )
  const receitas = chefQ.configurado ? receitasQ.data : exReceitasDoChef(chef?.id)

  return (
    <PublicLayout voltar={true}>
      <EstadoVazio carregando={chefQ.configurado && chefQ.carregando} erro={chefQ.configurado ? chefQ.erro : null} vazio={!chefQ.carregando && !chef} mensagemVazio="Chef não encontrado." />
      {chef && (
        <article>
          <div className="flex items-center gap-4 mb-5">
            {chef.foto_url ? (
              <img src={chef.foto_url} alt={chef.nome} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-ics-preto text-white flex items-center justify-center font-title text-2xl font-semibold flex-shrink-0">
                {chef.iniciais || chef.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
            )}
            <div>
              {chef.cargo && <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide">{chef.cargo}</p>}
              <h1 className="font-title text-2xl font-semibold leading-tight">{chef.nome}</h1>
              {chef.especialidade && <p className="text-sm text-ics-cinza">{chef.especialidade}</p>}
              {chef.cidade_base && <p className="text-sm text-ics-cinza">{chef.cidade_base}</p>}
            </div>
          </div>

          {chef.bio && <p className="text-sm leading-relaxed text-ics-preto/90 mb-4">{chef.bio}</p>}

          {chef.whatsapp && linkWhatsapp(chef.whatsapp) && (
            <a
              href={linkWhatsapp(chef.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold rounded-full px-4 py-2.5 text-sm mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.087zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Conversar no WhatsApp
            </a>
          )}

          {receitas && receitas.length > 0 && (
            <>
              <h2 className="font-title text-lg font-semibold mb-3">Receitas de {chef.nome.split(' ')[0]}</h2>
              <div className="grid grid-cols-2 gap-3">
                {receitas.map((r) => (
                  <Link key={r.id} to={`/receitas/${r.id}`} className="bg-white rounded-2xl border border-black/5 overflow-hidden active:scale-[0.98] transition-transform">
                    <Foto src={r.foto_url} alt={r.titulo} />
                    <div className="p-3">
                      {r.categoria && <p className="text-xs text-ics-cinza">{r.categoria}</p>}
                      <p className="font-semibold text-sm leading-tight">{r.titulo}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </article>
      )}
    </PublicLayout>
  )
}
