import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { IconDownload } from '../components/Icons.jsx'
import { showToast } from '../utils/toast.js'

export default function ClienteMateriais() {
  const { session } = useSession()
  const { materiaisDoRestaurante } = useData()

  const materiais = materiaisDoRestaurante(session.restauranteId)

  return (
    <Layout titulo="Materiais">
      {materiais.length === 0 && <p className="text-sm text-ics-cinza">Nenhum material compartilhado com você ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {materiais.map((m) => (
          <Card key={m.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">{m.nome}</p>
              <p className="text-xs text-ics-cinza">{m.tipo} · {m.tamanho}</p>
            </div>
            <button onClick={() => showToast('Download simulado neste protótipo.', '⬇')} className="flex items-center gap-1.5 text-sm font-medium text-ics-preto flex-shrink-0">
              <IconDownload width={17} height={17} /> Baixar
            </button>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
