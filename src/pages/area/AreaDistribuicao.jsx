import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { STATUS_RESTAURANTE } from '../../data/opcoes.js'

function semAcento(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function AreaDistribuicao() {
  const [restaurantes, setRestaurantes] = useState([])
  const [chefs, setChefs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroChef, setFiltroChef] = useState('todos') // todos | sem | <chefId>

  async function carregar() {
    setCarregando(true)
    const [{ data: rs }, { data: cfs }] = await Promise.all([
      supabase.from('restaurantes').select('id,nome,tipo,status,chef_id,cidade_id,cidades(nome)').order('nome'),
      supabase.from('chefs').select('id,nome,slug').eq('ativo', true).order('nome'),
    ])
    setRestaurantes(rs || [])
    setChefs((cfs || []).filter((c) => !['cesar-santos', 'luciano-roberto', 'joselia-maria'].includes(c.slug)))
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  async function atualizar(rid, patch) {
    const { error } = await supabase.from('restaurantes').update(patch).eq('id', rid)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { setRestaurantes((l) => l.map((r) => (r.id === rid ? { ...r, ...patch } : r))); showToast('Atualizado.', '✓') }
  }

  const lista = useMemo(() => {
    const b = semAcento(busca.trim())
    return restaurantes.filter((r) => {
      if (filtroChef === 'sem' && r.chef_id) return false
      if (filtroChef !== 'todos' && filtroChef !== 'sem' && r.chef_id !== filtroChef) return false
      if (b && !semAcento(`${r.nome} ${r.cidades?.nome || ''}`).includes(b)) return false
      return true
    })
  }, [restaurantes, busca, filtroChef])

  const semChef = restaurantes.filter((r) => !r.chef_id).length

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Distribuição" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <p className="text-sm text-ics-cinza mb-3">{restaurantes.length} restaurantes · {semChef} sem chef</p>
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar restaurante ou cidade…" aria-label="Buscar restaurante ou cidade" className="ics-input mb-3" />
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <Chip ativo={filtroChef === 'todos'} onClick={() => setFiltroChef('todos')}>Todos</Chip>
          <Chip ativo={filtroChef === 'sem'} onClick={() => setFiltroChef('sem')}>Sem chef</Chip>
          {chefs.map((c) => <Chip key={c.id} ativo={filtroChef === c.id} onClick={() => setFiltroChef(c.id)}>{c.nome.split(' ')[0]}</Chip>)}
        </div>

        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && lista.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhum restaurante neste filtro.</p>}

        <div className="flex flex-col gap-2.5">
          {lista.map((r) => (
            <Card key={r.id}>
              <p className="font-semibold">{r.nome}</p>
              <p className="text-sm text-ics-cinza mb-2">{[r.cidades?.nome, r.tipo].filter(Boolean).join(' · ')}</p>
              <div className="flex gap-2 border-t border-black/5 pt-2.5">
                <label className="text-xs text-ics-cinza flex-1">Chef
                  <select className="ics-input mt-0.5 text-sm" value={r.chef_id || ''} onChange={(e) => atualizar(r.id, { chef_id: e.target.value || null })}>
                    <option value="">— não distribuído —</option>
                    {chefs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </label>
                <label className="text-xs text-ics-cinza flex-1">Status
                  <select className="ics-input mt-0.5 text-sm" value={r.status || 'prospect'} onChange={(e) => atualizar(r.id, { status: e.target.value })}>
                    {STATUS_RESTAURANTE.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                </label>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function Chip({ ativo, onClick, children }) {
  return (
    <button onClick={onClick} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border ${ativo ? 'bg-ics-preto text-white border-ics-preto' : 'bg-white text-ics-cinza border-black/10'}`}>{children}</button>
  )
}
