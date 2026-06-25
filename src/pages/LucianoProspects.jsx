import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import FilterTabs from '../components/FilterTabs.jsx'

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'cliente', label: 'Clientes' },
  { value: 'inativo', label: 'Inativos' },
]

export default function LucianoProspects() {
  const navigate = useNavigate()
  const { restaurantes } = useData()
  const [filtro, setFiltro] = useState('todos')

  const lista = restaurantes.filter((r) => filtro === 'todos' || r.status === filtro)

  return (
    <Layout titulo="Restaurantes">
      <div className="mb-4">
        <FilterTabs opcoes={FILTROS} ativo={filtro} onChange={setFiltro} />
      </div>

      {lista.length === 0 && <p className="text-sm text-ics-cinza">Nenhum restaurante neste filtro.</p>}

      <div className="flex flex-col gap-2.5">
        {lista.map((r) => (
          <Card key={r.id} onClick={() => navigate(`/restaurantes/${r.id}`)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.nome}</p>
                <p className="text-sm text-ics-cinza truncate">{r.cidade} · {r.tipo}</p>
              </div>
              <Badge status={r.status} />
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
