import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import FilterTabs from '../components/FilterTabs.jsx'
import { fmtData } from '../utils/formatters.js'

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'realizado', label: 'Realizados' },
  { value: 'cancelado', label: 'Cancelados' },
]

export default function LucianoAgenda() {
  const navigate = useNavigate()
  const { agendamentos, restauranteById } = useData()
  const [filtro, setFiltro] = useState('todos')

  const lista = agendamentos
    .filter((a) => filtro === 'todos' || a.status === filtro)
    .sort((a, b) => (a.diasPlanejados[0]?.data || '').localeCompare(b.diasPlanejados[0]?.data || ''))

  return (
    <Layout titulo="Agenda geral">
      <div className="mb-4">
        <FilterTabs opcoes={FILTROS} ativo={filtro} onChange={setFiltro} />
      </div>

      {lista.length === 0 && <p className="text-sm text-ics-cinza">Nenhuma consultoria neste filtro.</p>}

      <div className="flex flex-col gap-2.5">
        {lista.map((a) => {
          const rest = restauranteById(a.restauranteId)
          const chef = chefById(a.chefId)
          return (
            <Card key={a.id} onClick={() => navigate(`/agendamentos/${a.id}`)}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{rest?.nome}</p>
                  <p className="text-sm text-ics-cinza truncate">{chef?.nome} · {fmtData(a.diasPlanejados[0]?.data)}</p>
                </div>
                <Badge status={a.status} />
              </div>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}
