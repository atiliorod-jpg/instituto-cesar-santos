import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'

export default function ChefClientes() {
  const navigate = useNavigate()
  const { session } = useSession()
  const { restaurantesDoChef, cidadeById } = useData()

  const clientes = restaurantesDoChef(session.chefId)

  return (
    <Layout titulo="Meus clientes">
      {clientes.length === 0 && <p className="text-sm text-ics-cinza">Você ainda não atendeu nenhum restaurante.</p>}
      <div className="flex flex-col gap-2.5">
        {clientes.map((r) => (
          <Card key={r.id} onClick={() => navigate(`/restaurantes/${r.id}`)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.nome}</p>
                <p className="text-sm text-ics-cinza truncate">{cidadeById(r.cidadeId)?.nome}</p>
              </div>
              <Badge status={r.status} />
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
