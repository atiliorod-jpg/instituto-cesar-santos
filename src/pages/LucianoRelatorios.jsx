import { useData } from '../store/DataContext.jsx'
import { CHEFS } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'

export default function LucianoRelatorios() {
  const { agendamentos, restaurantes, cidades: listaCidades } = useData()
  const validas = agendamentos.filter((a) => a.status !== 'cancelado')

  const porChef = CHEFS
    .map((c) => ({ label: c.nome, valor: validas.filter((a) => a.chefId === c.id).length }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor)

  const porCidade = listaCidades
    .map((cid) => {
      const idsNaCidade = new Set(restaurantes.filter((r) => r.cidadeId === cid.id).map((r) => r.id))
      return { label: cid.nome, valor: validas.filter((a) => idsNaCidade.has(a.restauranteId)).length }
    })
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor)

  return (
    <Layout titulo="Relatórios">
      <Secao titulo="Consultorias por chef" dados={porChef} />
      <Secao titulo="Consultorias por cidade" dados={porCidade} />
    </Layout>
  )
}

function Secao({ titulo, dados }) {
  const max = Math.max(1, ...dados.map((d) => d.valor))
  return (
    <Card className="mb-4">
      <h2 className="font-title text-base font-semibold mb-3">{titulo}</h2>
      {dados.length === 0 && <p className="text-sm text-ics-cinza">Sem dados ainda.</p>}
      <div className="flex flex-col gap-3">
        {dados.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium truncate">{d.label}</span>
              <span className="text-ics-cinza flex-shrink-0 ml-2">{d.valor}</span>
            </div>
            <div className="h-2 rounded-full bg-ics-bege overflow-hidden">
              <div className="h-full bg-ics-dourado rounded-full" style={{ width: `${(d.valor / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
