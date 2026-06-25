import { useParams } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { fmtDataLonga } from '../utils/formatters.js'

export default function ClienteRelatorio() {
  const { id } = useParams()
  const { session } = useSession()
  const { agendamentoById, getFotosVisiveis, getRelatorio } = useData()

  const agendamento = agendamentoById(id)
  const autorizado = agendamento && agendamento.restauranteId === session.restauranteId
  const fotos = autorizado ? getFotosVisiveis(id, session) : []
  const relatorio = autorizado ? getRelatorio(id) : ''

  if (!autorizado) {
    return (
      <Layout titulo="Relatório" voltar={true}>
        <p className="text-sm text-ics-cinza">Relatório não encontrado.</p>
      </Layout>
    )
  }

  return (
    <Layout titulo="Relatório da consultoria" voltar={true}>
      <p className="text-sm text-ics-cinza mb-1">{chefById(agendamento.chefId)?.nome}</p>
      <p className="text-sm text-ics-cinza mb-5">{fmtDataLonga(agendamento.diasPlanejados[0]?.data)}</p>

      <Card className="mb-5">
        <p className="text-sm whitespace-pre-line">{relatorio || 'Relatório ainda não disponível.'}</p>
      </Card>

      {agendamento.dataProximoSugerida && (
        <Card className="mb-5 border-2 border-ics-dourado/50">
          <p className="text-xs font-semibold text-ics-dourado mb-1">PRÓXIMO ATENDIMENTO SUGERIDO</p>
          <p className="font-semibold">{fmtDataLonga(agendamento.dataProximoSugerida)}</p>
        </Card>
      )}

      <h2 className="font-title text-base font-semibold mb-2.5">Fotos compartilhadas</h2>
      {fotos.length === 0 ? (
        <p className="text-sm text-ics-cinza">Nenhuma foto compartilhada nesta visita.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {fotos.map((f) => (
            <div key={f.id} className="aspect-square rounded-xl bg-ics-preto/5 border border-black/5 p-2.5 flex items-end">
              <p className="text-xs text-ics-cinza leading-snug">{f.label}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
