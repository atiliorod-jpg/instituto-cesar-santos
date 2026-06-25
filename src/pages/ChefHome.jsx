import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { fmtData } from '../utils/formatters.js'

export default function ChefHome() {
  const navigate = useNavigate()
  const { session } = useSession()
  const { agendamentosDoChef, restauranteById, restaurantesDoChef, cidadeById } = useData()

  const chef = chefById(session.chefId)
  const ags = agendamentosDoChef(session.chefId)
  const pendentes = ags.filter((a) => a.status === 'agendado')
  const realizadas = ags.filter((a) => a.status === 'realizado')

  // Restaurantes recebidos do diretor que ainda não têm consultoria agendada
  const comAgendamento = new Set(ags.map((a) => a.restauranteId))
  const aAgendar = restaurantesDoChef(session.chefId).filter((r) => !comAgendamento.has(r.id) && r.status !== 'inativo')

  function abrir(a) {
    if (a.status === 'agendado') navigate(`/consultoria/${a.id}`)
    else navigate(`/restaurantes/${a.restauranteId}`)
  }

  return (
    <Layout titulo={`Olá, ${chef?.nome.split(' ')[0]}`}>
      {aAgendar.length > 0 && (
        <>
          <h2 className="font-title text-base font-semibold mb-2.5">Recebidos — a agendar</h2>
          <div className="flex flex-col gap-2.5 mb-6">
            {aAgendar.map((r) => (
              <Card key={r.id} onClick={() => navigate(`/novo-agendamento?restauranteId=${r.id}`)} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{r.nome}</p>
                  <p className="text-sm text-ics-cinza truncate">{cidadeById(r.cidadeId)?.nome}</p>
                </div>
                <span className="badge badge-gold">Agendar</span>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="font-title text-base font-semibold mb-2.5">Pendentes</h2>
      {pendentes.length === 0 && <p className="text-sm text-ics-cinza mb-5">Nenhuma consultoria pendente.</p>}
      <div className="flex flex-col gap-2.5 mb-6">
        {pendentes.map((a) => (
          <Linha key={a.id} a={a} restauranteById={restauranteById} cidadeById={cidadeById} onClick={() => abrir(a)} />
        ))}
      </div>

      <h2 className="font-title text-base font-semibold mb-2.5">Já realizadas</h2>
      {realizadas.length === 0 && <p className="text-sm text-ics-cinza">Nenhuma consultoria realizada ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {realizadas.map((a) => (
          <Linha key={a.id} a={a} restauranteById={restauranteById} cidadeById={cidadeById} onClick={() => abrir(a)} />
        ))}
      </div>
    </Layout>
  )
}

function Linha({ a, restauranteById, cidadeById, onClick }) {
  const rest = restauranteById(a.restauranteId)
  return (
    <Card onClick={onClick} className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="font-semibold truncate">{rest?.nome}</p>
        <p className="text-sm text-ics-cinza truncate">{cidadeById(rest?.cidadeId)?.nome} · {fmtData(a.diasPlanejados[0]?.data)}</p>
      </div>
      <Badge status={a.status} />
    </Card>
  )
}
