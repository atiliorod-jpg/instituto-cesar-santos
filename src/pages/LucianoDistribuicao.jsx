import { useMemo, useState } from 'react'
import { useData } from '../store/DataContext.jsx'
import { CHEFS } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { showToast } from '../utils/toast.js'
import { STATUS_RESTAURANTE } from '../data/opcoes.js'

function semAcento(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function LucianoDistribuicao() {
  const { restaurantes, cidadeById, atribuirChef } = useData()
  const [busca, setBusca] = useState('')
  const [filtroChef, setFiltroChef] = useState('todos') // todos | sem | <chefId>

  const lista = useMemo(() => {
    const b = semAcento(busca.trim())
    return restaurantes.filter((r) => {
      if (filtroChef === 'sem' && r.chefId) return false
      if (filtroChef !== 'todos' && filtroChef !== 'sem' && r.chefId !== filtroChef) return false
      if (b && !semAcento(`${r.nome} ${cidadeById(r.cidadeId)?.nome || ''}`).includes(b)) return false
      return true
    })
  }, [restaurantes, busca, filtroChef, cidadeById])

  const semChef = restaurantes.filter((r) => !r.chefId).length

  return (
    <Layout titulo="Distribuição">
      <p className="text-sm text-ics-cinza mb-3">{restaurantes.length} restaurantes · {semChef} sem chef</p>
      <label className="sr-only" htmlFor="busca-dist">Buscar restaurante ou cidade</label>
      <input id="busca-dist" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar restaurante ou cidade…" className="ics-input mb-3" />
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        <Chip ativo={filtroChef === 'todos'} onClick={() => setFiltroChef('todos')}>Todos</Chip>
        <Chip ativo={filtroChef === 'sem'} onClick={() => setFiltroChef('sem')}>Sem chef</Chip>
        {CHEFS.map((c) => <Chip key={c.id} ativo={filtroChef === c.id} onClick={() => setFiltroChef(c.id)}>{c.nome.split(' ')[0]}</Chip>)}
      </div>

      {lista.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhum restaurante neste filtro.</p>}

      <div className="flex flex-col gap-2.5">
        {lista.map((r) => (
          <Card key={r.id}>
            <p className="font-semibold">{r.nome}</p>
            <p className="text-sm text-ics-cinza mb-2">{[cidadeById(r.cidadeId)?.nome, r.tipo].filter(Boolean).join(' · ')}</p>
            <div className="flex gap-2 border-t border-black/5 pt-2.5">
              <label className="text-xs text-ics-cinza flex-1">Chef
                <select className="ics-input mt-0.5 text-sm" value={r.chefId || ''} onChange={(e) => { atribuirChef(r.id, e.target.value || null); showToast('Distribuição atualizada.', '✓') }}>
                  <option value="">— não distribuído —</option>
                  {CHEFS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </label>
              <div className="text-xs text-ics-cinza flex-1">Status
                <p className="ics-input mt-0.5 text-sm bg-transparent border-0 px-0">{STATUS_RESTAURANTE.find((s) => s.v === r.status)?.l || r.status}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}

function Chip({ ativo, onClick, children }) {
  return (
    <button onClick={onClick} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border ${ativo ? 'bg-ics-preto text-white border-ics-preto' : 'bg-white text-ics-cinza border-black/10'}`}>{children}</button>
  )
}
