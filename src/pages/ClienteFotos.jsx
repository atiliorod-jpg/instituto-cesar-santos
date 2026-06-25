import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import { fmtDataLonga } from '../utils/formatters.js'

export default function ClienteFotos() {
  const { session } = useSession()
  const { agendamentosDoRestaurante, getFotosVisiveis } = useData()

  const visitas = agendamentosDoRestaurante(session.restauranteId)
    .map((a) => ({ agendamento: a, fotos: getFotosVisiveis(a.id, session) }))
    .filter((v) => v.fotos.length > 0)
    .reverse()

  return (
    <Layout titulo="Fotos compartilhadas">
      {visitas.length === 0 && <p className="text-sm text-ics-cinza">Nenhuma foto compartilhada ainda.</p>}
      {visitas.map(({ agendamento, fotos }) => (
        <div key={agendamento.id} className="mb-6">
          <p className="text-sm font-semibold mb-0.5">{chefById(agendamento.chefId)?.nome}</p>
          <p className="text-xs text-ics-cinza mb-2.5">{fmtDataLonga(agendamento.diasPlanejados[0]?.data)}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {fotos.map((f) => (
              <div key={f.id} className="aspect-square rounded-xl bg-ics-preto/5 border border-black/5 p-2.5 flex items-end">
                <p className="text-xs text-ics-cinza leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Layout>
  )
}
