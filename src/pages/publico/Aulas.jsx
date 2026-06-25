import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { fmtDataLonga } from '../../utils/formatters.js'
import { AULAS_EX, CHEFS_EX } from '../../data/exemplos.js'

const AULAS_EX_COM_CHEF = AULAS_EX.map((a) => ({ ...a, chefs: CHEFS_EX.find((c) => c.id === a.chef_id) || null }))

function semAcento(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Aulas() {
  const q = useQuery(() =>
    supabase.from('aulas').select('*, chefs(nome)').eq('publicada', true).order('data', { ascending: true })
  )
  const data = q.configurado ? q.data : AULAS_EX_COM_CHEF
  const carregando = q.configurado && q.carregando
  const erro = q.configurado ? q.erro : null

  const [busca, setBusca] = useState('')

  const lista = useMemo(() => {
    if (!data) return []
    const b = semAcento(busca.trim())
    if (!b) return data
    return data.filter((a) => semAcento(`${a.titulo} ${a.chefs?.nome || a.chef_nome || ''} ${a.cidade || ''}`).includes(b))
  }, [data, busca])

  return (
    <PublicLayout>
      <h1 className="font-title text-2xl font-semibold mb-3">Aulas & Cursos</h1>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por aula, chef ou cidade…"
        aria-label="Buscar por aula, chef ou cidade"
        className="ics-input mb-4"
      />

      <EstadoVazio carregando={carregando} erro={erro} vazio={data && lista.length === 0}
        mensagemVazio={busca ? 'Nenhuma aula encontrada.' : 'Nenhuma aula ou curso publicado ainda.'} />

      {lista.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {lista.map((a) => (
            <Link key={a.id} to={`/aulas/${a.id}`} className="bg-white rounded-2xl border border-black/5 p-4 active:scale-[0.98] transition-transform">
              <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-0.5">
                {a.tipo === 'curso' ? 'Curso' : 'Aula show'}
              </p>
              <p className="font-semibold leading-tight">{a.titulo}</p>
              <p className="text-sm text-ics-cinza mt-1">
                {[a.chefs?.nome || a.chef_nome, a.cidade, a.data && fmtDataLonga(a.data), a.hora].filter(Boolean).join(' · ')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  )
}
