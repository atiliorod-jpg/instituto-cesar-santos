import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import { useData } from '../store/DataContext.jsx'
import { CHEFS } from '../data/chefs.js'
import { TEAM } from '../data/team.js'
import Logo from '../components/Logo.jsx'
import Card from '../components/Card.jsx'
import { IconBack } from '../components/Icons.jsx'

export default function Login() {
  const { login } = useSession()
  const { restaurantes, cidadeById } = useData()
  const [grupo, setGrupo] = useState(null) // null | 'chef' | 'cliente'

  const clientes = restaurantes.filter((r) => r.status === 'cliente')

  if (grupo === 'chef') {
    return (
      <Selecao titulo="Quem é você?" onVoltar={() => setGrupo(null)}>
        {CHEFS.map((chef) => (
          <BotaoPerfil key={chef.id} label={chef.nome} sub="Chef Consultor" onClick={() => login('chef', { chefId: chef.id })} />
        ))}
      </Selecao>
    )
  }

  if (grupo === 'cliente') {
    return (
      <Selecao titulo="Qual é o seu restaurante?" onVoltar={() => setGrupo(null)}>
        {clientes.map((r) => (
          <BotaoPerfil key={r.id} label={r.nome} sub={cidadeById(r.cidadeId)?.nome} onClick={() => login('cliente', { restauranteId: r.id })} />
        ))}
      </Selecao>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege flex flex-col items-center justify-center px-6 py-10 gap-8">
      <Logo variant="full" />
      <p className="text-sm text-ics-cinza text-center -mt-4">Demonstração — entre como um dos perfis para explorar a área da equipe.</p>
      <div className="w-full max-w-sm flex flex-col gap-3">
        <BotaoPerfil label={TEAM.diretor.nome} sub={TEAM.diretor.cargo} destaque onClick={() => login('luciano')} />
        <BotaoPerfil label="Chef Consultor" sub="Documentar consultorias" onClick={() => setGrupo('chef')} />
        <BotaoPerfil label={TEAM.captacao.nome} sub={TEAM.captacao.cargo} onClick={() => login('captacao')} />
        <BotaoPerfil label="Cliente / Restaurante" sub="Acompanhar consultoria" onClick={() => setGrupo('cliente')} />
      </div>
      <Link to="/" className="text-sm text-ics-cinza font-medium">‹ Voltar ao site</Link>
    </div>
  )
}

function Selecao({ titulo, onVoltar, children }) {
  return (
    <div className="min-h-screen bg-ics-bege px-5 py-6">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onVoltar} className="p-1.5 -ml-1.5 text-ics-preto"><IconBack /></button>
        <h1 className="font-title text-xl font-semibold text-ics-preto">{titulo}</h1>
      </div>
      <div className="flex flex-col gap-2.5 max-w-sm mx-auto">{children}</div>
    </div>
  )
}

function BotaoPerfil({ label, sub, onClick, destaque }) {
  return (
    <Card
      onClick={onClick}
      className={`flex items-center justify-between py-4 ${destaque ? 'border-ics-dourado/40 !bg-ics-preto text-white' : ''}`}
    >
      <div>
        <p className="font-semibold">{label}</p>
        {sub && <p className={`text-sm ${destaque ? 'text-white/70' : 'text-ics-cinza'}`}>{sub}</p>}
      </div>
      <span className={destaque ? 'text-ics-dourado' : 'text-ics-cinza'}>›</span>
    </Card>
  )
}
