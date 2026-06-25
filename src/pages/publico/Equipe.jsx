import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { CHEFS_EX } from '../../data/exemplos.js'

function iniciaisDe(c) {
  return c.iniciais || c.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')
}

export default function Equipe() {
  const q = useQuery(() =>
    supabase.from('chefs').select('id,nome,slug,iniciais,cargo,especialidade,foto_url,destaque,bio').eq('ativo', true).order('ordem')
  )
  // Sem banco conectado: mostra a equipe de exemplo
  const data = q.configurado ? q.data : CHEFS_EX
  const carregando = q.configurado && q.carregando
  const erro = q.configurado ? q.erro : null

  const destaque = data && data.find((c) => c.destaque)
  const restante = data ? data.filter((c) => !c.destaque) : []

  return (
    <PublicLayout>
      <h1 className="font-title text-2xl font-semibold mb-1">Nossa equipe</h1>
      <p className="text-sm text-ics-cinza mb-5">As pessoas por trás do Instituto César Santos.</p>
      <EstadoVazio carregando={carregando} erro={erro} vazio={data && data.length === 0} mensagemVazio="Equipe em atualização." />

      {destaque && (
        <Link to={`/equipe/${destaque.slug || destaque.id}`} className="block bg-white rounded-2xl border border-black/5 overflow-hidden mb-4 active:scale-[0.99] transition-transform">
          <div className="flex flex-col sm:flex-row">
            {destaque.foto_url ? (
              <img src={destaque.foto_url} alt={destaque.nome} className="w-full sm:w-44 aspect-[4/3] sm:aspect-square object-cover object-top" />
            ) : (
              <div className="w-full sm:w-44 aspect-square bg-ics-preto text-white flex items-center justify-center font-title text-4xl font-semibold">{iniciaisDe(destaque)}</div>
            )}
            <div className="p-4 flex-1">
              {destaque.cargo && <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-0.5">{destaque.cargo}</p>}
              <p className="font-title text-xl font-semibold leading-tight">{destaque.nome}</p>
              {destaque.bio && <p className="text-sm text-ics-cinza mt-1 line-clamp-3">{destaque.bio}</p>}
              <span className="inline-block text-sm text-ics-preto font-medium mt-2">Ver perfil ›</span>
            </div>
          </div>
        </Link>
      )}

      {restante.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {restante.map((c) => (
            <Link key={c.id} to={`/equipe/${c.slug || c.id}`} className="bg-white rounded-2xl border border-black/5 overflow-hidden active:scale-[0.98] transition-transform text-center">
              {c.foto_url ? (
                <img src={c.foto_url} alt={c.nome} className="aspect-square w-full object-cover object-top" />
              ) : (
                <div className="aspect-square w-full bg-ics-preto text-white flex items-center justify-center font-title text-3xl font-semibold">
                  {iniciaisDe(c)}
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-sm leading-tight">{c.nome}</p>
                {(c.cargo || c.especialidade) && <p className="text-xs text-ics-cinza mt-0.5">{c.cargo || c.especialidade}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  )
}
