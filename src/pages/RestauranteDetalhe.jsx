import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { useSession } from '../store/SessionContext.jsx'
import { CHEFS, chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { IconPhone } from '../components/Icons.jsx'
import { fmtData } from '../utils/formatters.js'
import { showToast } from '../utils/toast.js'

export default function RestauranteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const { restauranteById, agendamentosDoRestaurante, cidadeById, atribuirChef } = useData()

  const restaurante = restauranteById(id)
  const agendamentos = agendamentosDoRestaurante(id)

  if (!restaurante) {
    return (
      <Layout titulo="Restaurante" voltar={true}>
        <p className="text-sm text-ics-cinza">Restaurante não encontrado.</p>
      </Layout>
    )
  }

  const telefoneLimpo = restaurante.contato.replace(/\D/g, '')

  function abrirAgendamento(agendamentoId, chefId) {
    if (session.role === 'luciano') {
      navigate(`/agendamentos/${agendamentoId}`)
    } else if (session.role === 'chef' && session.chefId === chefId) {
      navigate(`/consultoria/${agendamentoId}`)
    }
  }

  return (
    <Layout titulo={restaurante.nome} voltar={true}>
      <div className="flex items-center gap-2 mb-4">
        <Badge status={restaurante.status} />
        <span className="text-sm text-ics-cinza">{cidadeById(restaurante.cidadeId)?.nome} · {restaurante.tipo}</span>
      </div>

      <Card className="mb-4">
        <p className="text-sm text-ics-cinza mb-1">Responsável</p>
        <p className="font-semibold mb-3">{restaurante.responsavel}</p>
        <a
          href={`https://wa.me/55${telefoneLimpo.replace(/^55/, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-ics-preto font-medium"
        >
          <IconPhone width={18} height={18} />
          {restaurante.contato}
        </a>
        {restaurante.observacoes && (
          <p className="text-sm text-ics-cinza mt-3 pt-3 border-t border-black/5">{restaurante.observacoes}</p>
        )}
      </Card>

      {session.role === 'luciano' && (
        <Card className="mb-5">
          <p className="text-sm text-ics-cinza mb-2">Chef responsável</p>
          <select
            className="ics-input"
            value={restaurante.chefId || ''}
            onChange={(e) => { atribuirChef(restaurante.id, e.target.value || null); showToast('Distribuição atualizada.', '✓') }}
          >
            <option value="">— não distribuído —</option>
            {CHEFS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Card>
      )}

      {session.role === 'chef' && session.chefId === restaurante.chefId && (
        <button
          onClick={() => navigate(`/novo-agendamento?restauranteId=${restaurante.id}`)}
          className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mb-5"
        >
          + Agendar consultoria
        </button>
      )}

      <h2 className="font-title text-base font-semibold mb-2.5">Histórico de consultorias</h2>
      {agendamentos.length === 0 && <p className="text-sm text-ics-cinza">Nenhuma consultoria registrada ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {agendamentos.map((a) => {
          const chef = chefById(a.chefId)
          const clicavel = session.role === 'luciano' || (session.role === 'chef' && session.chefId === a.chefId)
          return (
            <Card key={a.id} onClick={clicavel ? () => abrirAgendamento(a.id, a.chefId) : undefined}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{chef?.nome}</p>
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
