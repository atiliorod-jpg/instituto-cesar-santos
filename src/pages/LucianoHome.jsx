import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { chefById } from '../data/chefs.js'
import { TEAM } from '../data/team.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { fmtData } from '../utils/formatters.js'

const MODULOS = [
  { to: '/cidades', titulo: 'Cidades & Restaurantes', desc: 'Cadastro e distribuição' },
  { to: '/distribuicao', titulo: 'Distribuição', desc: 'Restaurantes por chef' },
  { to: '/agenda', titulo: 'Agenda geral', desc: 'Consultorias' },
  { to: '/chefs', titulo: 'Chefs', desc: 'Equipe e carga' },
  { to: '/relatorios', titulo: 'Relatórios', desc: 'Números por cidade/chef' },
  { to: '/receitas', titulo: 'Receitas', desc: 'Criar e editar' },
  { to: '/aulas', titulo: 'Aulas & Cursos', desc: 'Criar e editar' },
]

export default function LucianoHome() {
  const navigate = useNavigate()
  const { cidades, restaurantes, agendamentos, restauranteById } = useData()

  const semChef = restaurantes.filter((r) => !r.chefId && r.status !== 'inativo').length
  const clientesAtivos = restaurantes.filter((r) => r.status === 'cliente').length
  const realizadas = agendamentos.filter((a) => a.status === 'realizado').length
  const totalCidades = cidades.length

  const proximas = agendamentos
    .filter((a) => a.status === 'agendado')
    .sort((a, b) => (a.diasPlanejados[0]?.data || '').localeCompare(b.diasPlanejados[0]?.data || ''))
    .slice(0, 3)

  return (
    <Layout titulo={`Olá, ${TEAM.diretor.nome.split(' ')[0]}`}>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="Cidades de atendimento" valor={totalCidades} />
        <Stat label="Clientes ativos" valor={clientesAtivos} />
        <Stat label="Restaurantes sem chef" valor={semChef} />
        <Stat label="Consultorias realizadas" valor={realizadas} />
      </div>

      <h2 className="font-title text-base font-semibold mb-2.5">Módulos</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MODULOS.map((m) => (
          <Link key={m.to} to={m.to} className="bg-white border border-black/5 rounded-2xl p-4 active:scale-[0.98] transition-transform block">
            <p className="font-semibold leading-tight">{m.titulo}</p>
            <p className="text-xs text-ics-cinza mt-0.5">{m.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-title text-base font-semibold mb-2.5">Próximas consultorias</h2>
      {proximas.length === 0 && (
        <p className="text-sm text-ics-cinza">Nenhuma consultoria agendada no momento.</p>
      )}
      <div className="flex flex-col gap-2.5">
        {proximas.map((a) => {
          const rest = restauranteById(a.restauranteId)
          const chef = chefById(a.chefId)
          return (
            <Card key={a.id} onClick={() => navigate(`/agendamentos/${a.id}`)} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold truncate">{rest?.nome}</p>
                <p className="text-sm text-ics-cinza truncate">{chef?.nome} · {fmtData(a.diasPlanejados[0]?.data)}</p>
              </div>
              <Badge status={a.status} />
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}

function Stat({ label, valor }) {
  return (
    <Card className="text-center py-5">
      <p className="font-title text-3xl font-semibold text-ics-preto">{valor}</p>
      <p className="text-xs text-ics-cinza mt-1">{label}</p>
    </Card>
  )
}
