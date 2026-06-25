import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext.jsx'
import { SessionProvider, useSession } from './store/SessionContext.jsx'
import { DataProvider } from './store/DataContext.jsx'

// Lado público (sem login)
import Home from './pages/publico/Home.jsx'
import Receitas from './pages/publico/Receitas.jsx'
import ReceitaDetalhe from './pages/publico/ReceitaDetalhe.jsx'
import Aulas from './pages/publico/Aulas.jsx'
import AulaDetalhe from './pages/publico/AulaDetalhe.jsx'
import Equipe from './pages/publico/Equipe.jsx'
import ChefDetalhe from './pages/publico/ChefDetalhe.jsx'
import SobrePublico from './pages/publico/SobrePublico.jsx'
import RestaurantePublico from './pages/publico/RestaurantePublico.jsx'

// Login real (Supabase) + área da equipe (Supabase)
import Entrar from './pages/Entrar.jsx'
import AreaEquipe from './pages/AreaEquipe.jsx'
import AreaCidades from './pages/area/AreaCidades.jsx'
import AreaCidadeDetalhe from './pages/area/AreaCidadeDetalhe.jsx'
import AreaDistribuicao from './pages/area/AreaDistribuicao.jsx'
import AreaAgenda from './pages/area/AreaAgenda.jsx'
import AreaChefs from './pages/area/AreaChefs.jsx'
import AreaChefDetalhe from './pages/area/AreaChefDetalhe.jsx'
import AreaRelatorios from './pages/area/AreaRelatorios.jsx'
import AreaReceitas from './pages/area/AreaReceitas.jsx'
import AreaAulas from './pages/area/AreaAulas.jsx'
import AreaMeusRestaurantes from './pages/area/AreaMeusRestaurantes.jsx'
import AreaConsultorias from './pages/area/AreaConsultorias.jsx'
import AreaConsultoriaDetalhe from './pages/area/AreaConsultoriaDetalhe.jsx'
import AreaEquipeEditor from './pages/area/AreaEquipeEditor.jsx'
import AreaConteudo from './pages/area/AreaConteudo.jsx'

// Demonstração clicável (seletor de perfil + telas da equipe, dados de exemplo)
import Login from './pages/Login.jsx'
import LucianoHome from './pages/LucianoHome.jsx'
import Cidades from './pages/Cidades.jsx'
import CidadeDetalhe from './pages/CidadeDetalhe.jsx'
import RestauranteDetalhe from './pages/RestauranteDetalhe.jsx'
import AgendamentoDetalhe from './pages/AgendamentoDetalhe.jsx'
import LucianoAgenda from './pages/LucianoAgenda.jsx'
import LucianoChefs from './pages/LucianoChefs.jsx'
import ChefPerformance from './pages/ChefPerformance.jsx'
import LucianoRelatorios from './pages/LucianoRelatorios.jsx'
import LucianoDistribuicao from './pages/LucianoDistribuicao.jsx'
import LucianoReceitas from './pages/LucianoReceitas.jsx'
import LucianoAulas from './pages/LucianoAulas.jsx'
import ChefHome from './pages/ChefHome.jsx'
import NovoAgendamento from './pages/NovoAgendamento.jsx'
import ChefConsultoria from './pages/ChefConsultoria.jsx'
import ChefMateriais from './pages/ChefMateriais.jsx'
import ChefClientes from './pages/ChefClientes.jsx'
import CaptacaoHome from './pages/CaptacaoHome.jsx'
import CaptacaoNova from './pages/CaptacaoNova.jsx'
import ClienteHome from './pages/ClienteHome.jsx'
import ClienteRelatorio from './pages/ClienteRelatorio.jsx'
import ClienteFotos from './pages/ClienteFotos.jsx'
import ClienteMateriais from './pages/ClienteMateriais.jsx'

function DemoRoutes() {
  const { session } = useSession()

  if (session.role === 'luciano') {
    return (
      <Routes>
        <Route path="/" element={<LucianoHome />} />
        <Route path="/cidades" element={<Cidades />} />
        <Route path="/cidades/:id" element={<CidadeDetalhe />} />
        <Route path="/restaurantes/:id" element={<RestauranteDetalhe />} />
        <Route path="/agendamentos/:id" element={<AgendamentoDetalhe />} />
        <Route path="/agenda" element={<LucianoAgenda />} />
        <Route path="/chefs" element={<LucianoChefs />} />
        <Route path="/chefs/:id" element={<ChefPerformance />} />
        <Route path="/relatorios" element={<LucianoRelatorios />} />
        <Route path="/distribuicao" element={<LucianoDistribuicao />} />
        <Route path="/receitas" element={<LucianoReceitas />} />
        <Route path="/aulas" element={<LucianoAulas />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }
  if (session.role === 'chef') {
    return (
      <Routes>
        <Route path="/" element={<ChefHome />} />
        <Route path="/novo-agendamento" element={<NovoAgendamento />} />
        <Route path="/consultoria/:id" element={<ChefConsultoria />} />
        <Route path="/restaurantes/:id" element={<RestauranteDetalhe />} />
        <Route path="/agendamentos/:id" element={<AgendamentoDetalhe />} />
        <Route path="/materiais" element={<ChefMateriais />} />
        <Route path="/clientes" element={<ChefClientes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }
  if (session.role === 'captacao') {
    return (
      <Routes>
        <Route path="/" element={<CaptacaoHome />} />
        <Route path="/novo" element={<CaptacaoNova />} />
        <Route path="/restaurantes/:id" element={<RestauranteDetalhe />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }
  if (session.role === 'cliente') {
    return (
      <Routes>
        <Route path="/" element={<ClienteHome />} />
        <Route path="/relatorio/:id" element={<ClienteRelatorio />} />
        <Route path="/fotos" element={<ClienteFotos />} />
        <Route path="/materiais" element={<ClienteMateriais />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }
  return <Navigate to="/" replace />
}

function RequireAuth({ children }) {
  const { sessao, carregando } = useAuth()
  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-ics-cinza text-sm">Carregando…</div>
  }
  return sessao ? children : <Navigate to="/entrar" replace />
}

function AppRoutes() {
  const { session: demo } = useSession()

  // Sessão de demonstração ativa → área da equipe clicável (dados de exemplo)
  if (demo) return <DemoRoutes />

  // Senão, lado público + login real
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/receitas" element={<Receitas />} />
      <Route path="/receitas/:id" element={<ReceitaDetalhe />} />
      <Route path="/aulas" element={<Aulas />} />
      <Route path="/aulas/:id" element={<AulaDetalhe />} />
      <Route path="/equipe" element={<Equipe />} />
      <Route path="/equipe/:slug" element={<ChefDetalhe />} />
      <Route path="/sobre" element={<SobrePublico />} />
      <Route path="/r/:token" element={<RestaurantePublico />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/demo" element={<Login />} />
      <Route path="/area" element={<AreaEquipe />} />
      <Route path="/area/cidades" element={<RequireAuth><AreaCidades /></RequireAuth>} />
      <Route path="/area/cidades/:id" element={<RequireAuth><AreaCidadeDetalhe /></RequireAuth>} />
      <Route path="/area/distribuicao" element={<RequireAuth><AreaDistribuicao /></RequireAuth>} />
      <Route path="/area/agenda" element={<RequireAuth><AreaAgenda /></RequireAuth>} />
      <Route path="/area/chefs" element={<RequireAuth><AreaChefs /></RequireAuth>} />
      <Route path="/area/chefs/:id" element={<RequireAuth><AreaChefDetalhe /></RequireAuth>} />
      <Route path="/area/relatorios" element={<RequireAuth><AreaRelatorios /></RequireAuth>} />
      <Route path="/area/receitas" element={<RequireAuth><AreaReceitas /></RequireAuth>} />
      <Route path="/area/aulas" element={<RequireAuth><AreaAulas /></RequireAuth>} />
      <Route path="/area/meus-restaurantes" element={<RequireAuth><AreaMeusRestaurantes /></RequireAuth>} />
      <Route path="/area/consultorias" element={<RequireAuth><AreaConsultorias /></RequireAuth>} />
      <Route path="/area/consultorias/:id" element={<RequireAuth><AreaConsultoriaDetalhe /></RequireAuth>} />
      <Route path="/area/equipe" element={<RequireAuth><AreaEquipeEditor /></RequireAuth>} />
      <Route path="/area/conteudo" element={<RequireAuth><AreaConteudo /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <DataProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </SessionProvider>
    </AuthProvider>
  )
}
