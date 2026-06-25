import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { fmtData } from '../utils/formatters.js'

export default function CaptacaoHome() {
  const navigate = useNavigate()
  const { restaurantes, cidadeById } = useData()

  const meus = restaurantes
    .filter((r) => r.captadoPorId === 'captacao')
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))

  return (
    <Layout titulo="Meus prospects">
      <button
        onClick={() => navigate('/novo')}
        className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mb-5"
      >
        + Registrar novo prospect
      </button>

      {meus.length === 0 && <p className="text-sm text-ics-cinza">Nenhum prospect registrado ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {meus.map((r) => (
          <Card key={r.id} onClick={() => navigate(`/restaurantes/${r.id}`)}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.nome}</p>
                <p className="text-sm text-ics-cinza truncate">{cidadeById(r.cidadeId)?.nome} · {fmtData(r.criadoEm)}</p>
              </div>
              <Badge status={r.status} />
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
