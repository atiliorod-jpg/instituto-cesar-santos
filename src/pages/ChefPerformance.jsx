import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { fmtData } from '../utils/formatters.js'

export default function ChefPerformance() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agendamentosDoChef, restauranteById, restaurantesDoChef } = useData()

  const chef = chefById(id)
  const ags = agendamentosDoChef(id)
  const realizadas = ags.filter((a) => a.status === 'realizado').length
  const agendadas = ags.filter((a) => a.status === 'agendado').length
  const clientes = restaurantesDoChef(id).length

  if (!chef) {
    return (
      <Layout titulo="Chef" voltar={true}>
        <p className="text-sm text-ics-cinza">Chef não encontrado.</p>
      </Layout>
    )
  }

  return (
    <Layout titulo={chef.nome} voltar={true}>
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <Stat valor={realizadas} label="Realizadas" />
        <Stat valor={agendadas} label="Agendadas" />
        <Stat valor={clientes} label="Clientes" />
      </div>

      <h2 className="font-title text-base font-semibold mb-2.5">Consultorias</h2>
      <div className="flex flex-col gap-2.5">
        {ags.map((a) => {
          const rest = restauranteById(a.restauranteId)
          return (
            <Card key={a.id} onClick={() => navigate(`/agendamentos/${a.id}`)}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{rest?.nome}</p>
                  <p className="text-sm text-ics-cinza truncate">{fmtData(a.diasPlanejados[0]?.data)}</p>
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

function Stat({ valor, label }) {
  return (
    <Card className="text-center py-4">
      <p className="font-title text-2xl font-semibold">{valor}</p>
      <p className="text-xs text-ics-cinza mt-1">{label}</p>
    </Card>
  )
}
