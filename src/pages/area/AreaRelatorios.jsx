import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { labelStatusRestaurante } from '../../data/opcoes.js'

function Barras({ dados }) {
  const max = Math.max(1, ...dados.map((d) => d.valor))
  if (dados.length === 0) return <p className="text-sm text-ics-cinza">Sem dados ainda.</p>
  return (
    <div className="flex flex-col gap-3">
      {dados.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium truncate">{d.label}</span>
            <span className="text-ics-cinza flex-shrink-0 ml-2">{d.valor}</span>
          </div>
          <div className="h-2 rounded-full bg-ics-bege overflow-hidden">
            <div className="h-full bg-ics-dourado rounded-full" style={{ width: `${(d.valor / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AreaRelatorios() {
  const [porStatus, setPorStatus] = useState([])
  const [porCidade, setPorCidade] = useState([])
  const [porChef, setPorChef] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    ;(async () => {
      setCarregando(true)
      const [{ data: rs }, { data: cids }, { data: cfs }] = await Promise.all([
        supabase.from('restaurantes').select('status,cidade_id,chef_id'),
        supabase.from('cidades').select('id,nome'),
        supabase.from('chefs').select('id,nome'),
      ])
      const nomeCidade = Object.fromEntries((cids || []).map((c) => [c.id, c.nome]))
      const nomeChef = Object.fromEntries((cfs || []).map((c) => [c.id, c.nome]))

      const st = {}, ci = {}, ch = {}
      ;(rs || []).forEach((r) => {
        st[r.status] = (st[r.status] || 0) + 1
        if (r.cidade_id) ci[r.cidade_id] = (ci[r.cidade_id] || 0) + 1
        if (r.chef_id) ch[r.chef_id] = (ch[r.chef_id] || 0) + 1
      })
      const conv = (obj, nomes, fmtLabel) => Object.entries(obj)
        .map(([k, v]) => ({ label: fmtLabel ? fmtLabel(k) : (nomes ? nomes[k] || k : k), valor: v }))
        .sort((a, b) => b.valor - a.valor)

      setPorStatus(conv(st, null, labelStatusRestaurante))
      setPorCidade(conv(ci, nomeCidade))
      setPorChef(conv(ch, nomeChef))
      setCarregando(false)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Relatórios" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        <Card className="mb-4">
          <h2 className="font-title text-base font-semibold mb-3">Restaurantes por situação</h2>
          <Barras dados={porStatus} />
        </Card>
        <Card className="mb-4">
          <h2 className="font-title text-base font-semibold mb-3">Restaurantes por cidade</h2>
          <Barras dados={porCidade} />
        </Card>
        <Card className="mb-4">
          <h2 className="font-title text-base font-semibold mb-3">Restaurantes por chef</h2>
          <Barras dados={porChef} />
        </Card>
      </main>
    </div>
  )
}
