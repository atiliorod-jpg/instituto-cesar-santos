import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import { fmtData } from '../../utils/formatters.js'
import { labelStatusRestaurante } from '../../data/opcoes.js'

function primeiraData(dias) {
  if (!Array.isArray(dias) || !dias.length) return null
  return dias[0]?.data || null
}

export default function AreaAgenda() {
  const [ags, setAgs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    ;(async () => {
      setCarregando(true)
      const { data } = await supabase
        .from('agendamentos')
        .select('id,status,dias,data_proximo,restaurantes(nome),chefs(nome)')
      setAgs(data || [])
      setCarregando(false)
    })()
  }, [])

  const lista = useMemo(() => {
    const arr = filtro === 'todos' ? ags : ags.filter((a) => a.status === filtro)
    return [...arr].sort((a, b) => (primeiraData(a.dias) || '').localeCompare(primeiraData(b.dias) || ''))
  }, [ags, filtro])

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Agenda geral" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {['todos', 'agendado', 'realizado', 'cancelado'].map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border ${filtro === f ? 'bg-ics-preto text-white border-ics-preto' : 'bg-white text-ics-cinza border-black/10'}`}>
              {f === 'todos' ? 'Todos' : labelStatusRestaurante(f)}
            </button>
          ))}
        </div>

        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && lista.length === 0 && (
          <p className="text-sm text-ics-cinza py-6 text-center">
            Nenhuma consultoria agendada ainda. Elas aparecem aqui quando os chefs agendarem os atendimentos.
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          {lista.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{a.restaurantes?.nome || 'Restaurante'}</p>
                <p className="text-sm text-ics-cinza truncate">
                  {[a.chefs?.nome, primeiraData(a.dias) && fmtData(primeiraData(a.dias))].filter(Boolean).join(' · ')}
                </p>
              </div>
              <Badge status={a.status} />
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
