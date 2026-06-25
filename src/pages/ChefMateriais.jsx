import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { IconDownload, IconShare } from '../components/Icons.jsx'
import { showToast } from '../utils/toast.js'

export default function ChefMateriais() {
  const { session } = useSession()
  const { materiais, restaurantesDoChef, shareMaterial } = useData()

  const meusClientes = restaurantesDoChef(session.chefId)
  const categorias = [...new Set(materiais.map((m) => m.categoria))]

  function compartilhar(materialId, restauranteId) {
    if (!restauranteId) return
    shareMaterial(materialId, restauranteId)
    showToast('Material compartilhado com o cliente.', '✓')
  }

  return (
    <Layout titulo="Biblioteca de materiais">
      {categorias.map((categoria) => (
        <div key={categoria} className="mb-6">
          <h2 className="font-title text-base font-semibold mb-2.5">{categoria}</h2>
          <div className="flex flex-col gap-2.5">
            {materiais.filter((m) => m.categoria === categoria).map((m) => (
              <Card key={m.id}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{m.nome}</p>
                    <p className="text-xs text-ics-cinza">
                      {m.tipo} · {m.tamanho}{m.personalizavel ? ' · personalizável' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => showToast('Download simulado neste protótipo.', '⬇')} className="flex items-center gap-1.5 text-sm font-medium text-ics-preto">
                    <IconDownload width={17} height={17} /> Baixar
                  </button>
                  {meusClientes.length > 0 && (
                    <label className="flex items-center gap-1.5 text-sm font-medium text-ics-preto ml-auto">
                      <IconShare width={17} height={17} />
                      <select
                        defaultValue=""
                        onChange={(e) => compartilhar(m.id, e.target.value)}
                        className="text-sm border-none bg-transparent font-medium"
                      >
                        <option value="" disabled>Compartilhar…</option>
                        {meusClientes.map((r) => (
                          <option key={r.id} value={r.id} disabled={m.compartilhadoCom.includes(r.id)}>
                            {r.nome}{m.compartilhadoCom.includes(r.id) ? ' ✓' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Layout>
  )
}
