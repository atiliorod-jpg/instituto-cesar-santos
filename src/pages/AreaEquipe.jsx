import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'
import Notificacoes from '../components/Notificacoes.jsx'

const PAPEL_LABEL = {
  diretor: 'Diretor — controle total',
  chef: 'Chef Consultor',
  captacao: 'Captação',
  cliente: 'Restaurante parceiro',
}

async function contar(tabela, filtros) {
  let q = supabase.from(tabela).select('*', { count: 'exact', head: true })
  if (filtros) for (const [k, v] of Object.entries(filtros)) q = q.eq(k, v)
  const { count, error } = await q
  return error ? null : count
}

function Stat({ label, valor }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 text-center">
      <p className="font-title text-3xl font-semibold text-ics-preto">{valor ?? '—'}</p>
      <p className="text-xs text-ics-cinza mt-1">{label}</p>
    </div>
  )
}

export default function AreaEquipe() {
  const { perfil, sessao, logout, carregando } = useAuth()
  const [stats, setStats] = useState({})

  const email = sessao?.user?.email
  const papel = perfil?.papel || null
  const chefId = perfil?.chef_id
  const restauranteId = perfil?.restaurante_id

  useEffect(() => {
    if (!papel) return
    let ativo = true
    ;(async () => {
      const s = {}
      if (papel === 'diretor') {
        s.cidades = await contar('cidades', { ano: new Date().getFullYear() })
        s.restaurantes = await contar('restaurantes')
        s.agendamentos = await contar('agendamentos')
        s.receitas = await contar('receitas')
      } else if (papel === 'chef' && chefId) {
        s.restaurantes = await contar('restaurantes', { chef_id: chefId })
        s.agendamentos = await contar('agendamentos', { chef_id: chefId })
      } else if (papel === 'captacao') {
        s.restaurantes = await contar('restaurantes', { captado_por: perfil?.id })
      } else if (papel === 'cliente' && restauranteId) {
        s.agendamentos = await contar('agendamentos', { restaurante_id: restauranteId })
      }
      if (ativo) setStats(s)
    })()
    return () => { ativo = false }
  }, [papel, chefId, restauranteId, perfil?.id])

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-ics-cinza text-sm">Carregando…</div>
  }
  if (!sessao) return <Navigate to="/entrar" replace />

  const nome = perfil?.nome || email

  return (
    <div className="min-h-screen bg-ics-bege px-4 py-6">
      <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo variant="mark" className="w-6 h-6" />
          <span className="font-title font-semibold">Área da equipe</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Notificacoes userId={perfil?.id} />
          <Link to="/" className="text-ics-cinza font-medium">Ver site</Link>
          <button onClick={logout} className="text-ics-cinza font-medium">Sair</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6"><Logo variant="full" className="opacity-90" /></div>
        <p className="text-ics-cinza text-sm">Bem-vindo,</p>
        <h1 className="font-title text-2xl font-semibold mb-1">{nome}</h1>
        {papel && <p className="text-sm text-ics-dourado font-medium mb-6">{PAPEL_LABEL[papel] || papel}</p>}

        {!perfil && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3.5 py-2.5 mb-5">
            Sua conta entrou, mas ainda não tem um papel definido. O diretor precisa criar seu perfil
            na tabela <code>perfis</code> (veja SETUP_USUARIOS.md).
          </p>
        )}

        {papel === 'diretor' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Stat label="Cidades" valor={stats.cidades} />
              <Stat label="Restaurantes" valor={stats.restaurantes} />
              <Stat label="Consultorias" valor={stats.agendamentos} />
              <Stat label="Receitas" valor={stats.receitas} />
            </div>

            <h2 className="font-title text-base font-semibold mb-2.5">Módulos</h2>
            <div className="grid grid-cols-2 gap-3">
              <Modulo to="/area/cidades" titulo="Cidades & Restaurantes" desc="Cadastro e distribuição" />
              <Modulo to="/area/distribuicao" titulo="Distribuição" desc="Restaurantes por chef" />
              <Modulo to="/area/agenda" titulo="Agenda geral" desc="Consultorias" />
              <Modulo to="/area/chefs" titulo="Chefs" desc="Equipe e carga" />
              <Modulo to="/area/relatorios" titulo="Relatórios" desc="Números por cidade/chef" />
              <Modulo to="/area/receitas" titulo="Receitas" desc="Criar e editar" />
              <Modulo to="/area/aulas" titulo="Aulas & Cursos" desc="Criar e editar" />
              <Modulo to="/area/equipe" titulo="Equipe & Bios" desc="Editar perfis públicos" />
              <Modulo to="/area/conteudo" titulo="Conteúdo (Sobre)" desc="Textos institucionais" />
            </div>

            <Link to="/demo" className="block w-full text-center border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3 mt-4">
              Pré-visualizar como cada perfil (chef, captação, restaurante)
            </Link>
          </>
        )}

        {papel === 'chef' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Stat label="Meus restaurantes" valor={stats.restaurantes} />
              <Stat label="Minhas consultorias" valor={stats.agendamentos} />
            </div>

            <h2 className="font-title text-base font-semibold mb-2.5">Módulos</h2>
            <div className="grid grid-cols-2 gap-3">
              <Modulo to="/area/meus-restaurantes" titulo="Meus restaurantes" desc="Recebidos e contato" />
              <Modulo to="/area/consultorias" titulo="Minhas consultorias" desc="Agendar e registrar" />
              <Modulo to="/area/receitas" titulo="Minhas receitas" desc="Criar e publicar" />
              <Modulo to="/area/aulas" titulo="Aulas & Cursos" desc="Criar e publicar" />
            </div>
          </>
        )}

        {papel === 'captacao' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Stat label="Prospects cadastrados" valor={stats.restaurantes} />
          </div>
        )}

        {papel === 'cliente' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Stat label="Minhas consultorias" valor={stats.agendamentos} />
          </div>
        )}
      </div>
    </div>
  )
}

function Modulo({ to, titulo, desc, disabled }) {
  const conteudo = (
    <>
      <p className="font-semibold leading-tight">{titulo}</p>
      <p className="text-xs text-ics-cinza mt-0.5">{desc}</p>
    </>
  )
  if (disabled || !to) {
    return <div className="bg-white border border-black/5 rounded-2xl p-4 opacity-60">{conteudo}</div>
  }
  return (
    <Link to={to} className="bg-white border border-black/5 rounded-2xl p-4 active:scale-[0.98] transition-transform block">
      {conteudo}
    </Link>
  )
}
