import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { useSession } from '../store/SessionContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { fmtDataLonga } from '../utils/formatters.js'

export default function AgendamentoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const { agendamentoById, restauranteById, getFotosVisiveis, getNotaPrivada, getRelatorio } = useData()

  const agendamento = agendamentoById(id)

  if (!agendamento) {
    return (
      <Layout titulo="Consultoria" voltar={true}>
        <p className="text-sm text-ics-cinza">Agendamento não encontrado.</p>
      </Layout>
    )
  }

  const restaurante = restauranteById(agendamento.restauranteId)
  const chef = chefById(agendamento.chefId)
  const fotos = getFotosVisiveis(id, session)
  const fotosInternas = fotos.filter((f) => f.tipo === 'interna')
  const fotosCompartilhadas = fotos.filter((f) => f.tipo === 'compartilhada')
  const nota = getNotaPrivada(id, session)
  const relatorio = getRelatorio(id)

  return (
    <Layout titulo={restaurante?.nome || 'Consultoria'} voltar={true}>
      <div className="flex items-center gap-2 mb-4">
        <Badge status={agendamento.status} />
        <span className="text-sm text-ics-cinza">{chef?.nome}</span>
      </div>

      <Card className="mb-4">
        <p className="text-sm text-ics-cinza mb-2">Dias planejados</p>
        <div className="flex flex-col gap-1.5">
          {agendamento.diasPlanejados.map((d, i) => (
            <p key={i} className="text-sm font-medium">
              {fmtDataLonga(d.data)} — período da {d.periodo}, {d.horas}h
            </p>
          ))}
        </div>
        {agendamento.dataProximoSugerida && (
          <p className="text-sm text-ics-cinza mt-3 pt-3 border-t border-black/5">
            Próximo atendimento sugerido: <strong className="text-ics-preto">{fmtDataLonga(agendamento.dataProximoSugerida)}</strong>
          </p>
        )}
      </Card>

      {nota !== null && nota !== undefined && (
        <Card className="mb-4 border-2 border-ics-dourado/60">
          <p className="text-xs font-semibold text-ics-dourado mb-1.5">ANOTAÇÕES PRIVADAS — só chef + Luciano</p>
          <p className="text-sm whitespace-pre-line">{nota || 'Nenhuma anotação registrada.'}</p>
        </Card>
      )}

      {relatorio && (
        <Card className="mb-4">
          <p className="text-xs font-semibold text-ics-cinza mb-1.5">RELATÓRIO ENVIADO AO CLIENTE</p>
          <p className="text-sm whitespace-pre-line">{relatorio}</p>
        </Card>
      )}

      <h2 className="font-title text-base font-semibold mb-2.5">Fotos e vídeos — uso interno</h2>
      <p className="text-xs text-ics-cinza mb-2">Visível apenas para o chef e Luciano. Nunca aparece para o restaurante.</p>
      <GradeFotos fotos={fotosInternas} />

      <h2 className="font-title text-base font-semibold mb-2.5 mt-6">O que o restaurante recebeu</h2>
      <GradeFotos fotos={fotosCompartilhadas} vazio="Nenhuma foto compartilhada ainda." />
    </Layout>
  )
}

function GradeFotos({ fotos, vazio = 'Nenhuma foto registrada.' }) {
  if (fotos.length === 0) return <p className="text-sm text-ics-cinza mb-2">{vazio}</p>
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-2">
      {fotos.map((f) => (
        <div key={f.id} className="aspect-square rounded-xl bg-ics-preto/5 border border-black/5 p-2.5 flex items-end">
          <p className="text-xs text-ics-cinza leading-snug">{f.label}</p>
        </div>
      ))}
    </div>
  )
}
