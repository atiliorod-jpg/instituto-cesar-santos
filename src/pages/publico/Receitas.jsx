import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import PublicLayout from '../../components/PublicLayout.jsx'
import Foto from '../../components/Foto.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { RECEITAS_EX } from '../../data/exemplos.js'

function semAcento(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Receitas() {
  const q = useQuery(() =>
    supabase.from('receitas')
      .select('id,titulo,categoria,foto_url,autor,chefs(nome)')
      .eq('publicada', true).order('titulo')
  )
  const data = q.configurado ? q.data : RECEITAS_EX
  const carregando = q.configurado && q.carregando
  const erro = q.configurado ? q.erro : null

  const [busca, setBusca] = useState('')
  const [cat, setCat] = useState('Todas')

  const categorias = useMemo(() => {
    const set = new Set((data || []).map((r) => r.categoria).filter(Boolean))
    return ['Todas', ...[...set].sort()]
  }, [data])

  const lista = useMemo(() => {
    if (!data) return []
    const b = semAcento(busca.trim())
    return data.filter((r) => {
      if (cat !== 'Todas' && r.categoria !== cat) return false
      if (!b) return true
      const alvo = semAcento(`${r.titulo} ${r.autor || ''} ${r.chefs?.nome || ''}`)
      return alvo.includes(b)
    })
  }, [data, busca, cat])

  return (
    <PublicLayout>
      <h1 className="font-title text-2xl font-semibold mb-3">Receitas</h1>

      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por receita ou chef…"
        aria-label="Buscar por receita ou chef"
        className="ics-input mb-3"
      />

      {categorias.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-4">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border ${
                cat === c ? 'bg-ics-preto text-white border-ics-preto' : 'bg-white text-ics-cinza border-black/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <EstadoVazio carregando={carregando} erro={erro} vazio={data && lista.length === 0}
        mensagemVazio={busca || cat !== 'Todas' ? 'Nenhuma receita encontrada para esse filtro.' : 'Nenhuma receita publicada ainda.'} />

      {lista.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {lista.map((r) => (
            <Link key={r.id} to={`/receitas/${r.id}`} className="bg-white rounded-2xl border border-black/5 overflow-hidden active:scale-[0.98] transition-transform">
              <Foto src={r.foto_url} alt={r.titulo} />
              <div className="p-3">
                {r.categoria && <p className="text-xs text-ics-cinza">{r.categoria}</p>}
                <p className="font-semibold text-sm leading-tight">{r.titulo}</p>
                {(r.chefs?.nome || r.autor) && <p className="text-xs text-ics-cinza mt-1">por {r.chefs?.nome || r.autor}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  )
}
