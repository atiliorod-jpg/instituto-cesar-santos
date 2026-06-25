import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import Foto from '../../components/Foto.jsx'
import Logo from '../../components/Logo.jsx'
import { fmtData } from '../../utils/formatters.js'
import { RECEITAS_EX, AULAS_EX } from '../../data/exemplos.js'

export default function Home() {
  const receitasQ = useQuery(() => supabase.from('receitas').select('id,titulo,categoria,foto_url').eq('publicada', true).order('criado_em', { ascending: false }).limit(4))
  const aulasQ = useQuery(() => supabase.from('aulas').select('id,titulo,tipo,cidade,data,hora').eq('publicada', true).order('data', { ascending: true }).limit(3))

  // Sem banco conectado: usa conteúdo de exemplo
  const receitas = { ...receitasQ, data: receitasQ.configurado ? receitasQ.data : RECEITAS_EX.slice(0, 4), carregando: receitasQ.configurado && receitasQ.carregando }
  const aulas = { ...aulasQ, data: aulasQ.configurado ? aulasQ.data : AULAS_EX.slice(0, 3), carregando: aulasQ.configurado && aulasQ.carregando }

  return (
    <PublicLayout>
      <section className="text-center py-8 mb-8 border-b border-black/5">
        <div className="flex justify-center mb-4"><Logo variant="full" /></div>
        <p className="text-ics-cinza max-w-md mx-auto text-sm leading-relaxed">
          Fortalecendo a gastronomia pernambucana através de consultoria, aulas e cursos
          conduzidos por chefs do Instituto.
        </p>
      </section>

      <SecaoTitulo titulo="Próximas aulas & cursos" link="/aulas" />
      {aulas.data && aulas.data.length > 0 ? (
        <div className="flex flex-col gap-2.5 mb-10">
          {aulas.data.map((a) => (
            <Link key={a.id} to={`/aulas/${a.id}`} className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="min-w-0">
                <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide">{a.tipo === 'curso' ? 'Curso' : 'Aula show'}</p>
                <p className="font-semibold truncate">{a.titulo}</p>
                <p className="text-sm text-ics-cinza truncate">{[a.cidade, a.data && fmtData(a.data), a.hora].filter(Boolean).join(' · ')}</p>
              </div>
              <span className="text-ics-cinza ml-2">›</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ics-cinza mb-10">{aulas.carregando ? 'Carregando…' : 'Em breve, novas aulas e cursos.'}</p>
      )}

      <SecaoTitulo titulo="Receitas dos chefs" link="/receitas" />
      {receitas.data && receitas.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {receitas.data.map((r) => (
            <Link key={r.id} to={`/receitas/${r.id}`} className="bg-white rounded-2xl border border-black/5 overflow-hidden active:scale-[0.98] transition-transform">
              <Foto src={r.foto_url} alt={r.titulo} />
              <div className="p-3">
                {r.categoria && <p className="text-xs text-ics-cinza">{r.categoria}</p>}
                <p className="font-semibold text-sm leading-tight">{r.titulo}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ics-cinza">{receitas.carregando ? 'Carregando…' : 'Em breve, receitas publicadas pelos chefs.'}</p>
      )}
    </PublicLayout>
  )
}

function SecaoTitulo({ titulo, link }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-title text-lg font-semibold">{titulo}</h2>
      <Link to={link} className="text-sm text-ics-dourado font-medium">Ver tudo</Link>
    </div>
  )
}
