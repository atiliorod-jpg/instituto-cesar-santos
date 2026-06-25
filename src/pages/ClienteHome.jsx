import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { fmtDataLonga } from '../utils/formatters.js'

export default function ClienteHome() {
  const navigate = useNavigate()
  const { session } = useSession()
  const { restauranteById, agendamentosDoRestaurante, cidadeById } = useData()

  const restaurante = restauranteById(session.restauranteId)
  const agendamentos = agendamentosDoRestaurante(session.restauranteId)
  const proxima = agendamentos.find((a) => a.status === 'agendado')
  const realizadas = agendamentos.filter((a) => a.status === 'realizado').reverse()

  return (
    <Layout titulo={restaurante?.nome}>
      <p className="text-sm text-ics-cinza mb-5">{cidadeById(restaurante?.cidadeId)?.nome}</p>

      <h2 className="font-title text-base font-semibold mb-2.5">Próxima consultoria</h2>
      {proxima ? (
        <Card className="mb-6 border-2 border-ics-dourado/50">
          <p className="font-semibold">{chefById(proxima.chefId)?.nome}</p>
          {proxima.diasPlanejados.map((d, i) => (
            <p key={i} className="text-sm text-ics-cinza">{fmtDataLonga(d.data)} — período da {d.periodo}</p>
          ))}
        </Card>
      ) : (
        <p className="text-sm text-ics-cinza mb-6">Nenhuma consultoria agendada no momento.</p>
      )}

      <h2 className="font-title text-base font-semibold mb-2.5">Consultorias já realizadas</h2>
      {realizadas.length === 0 && <p className="text-sm text-ics-cinza">Ainda não há histórico.</p>}
      <div className="flex flex-col gap-2.5">
        {realizadas.map((a) => (
          <Card key={a.id} onClick={() => navigate(`/relatorio/${a.id}`)} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{chefById(a.chefId)?.nome}</p>
              <p className="text-sm text-ics-cinza">{fmtDataLonga(a.diasPlanejados[0]?.data)}</p>
            </div>
            <span className="text-ics-cinza">›</span>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
