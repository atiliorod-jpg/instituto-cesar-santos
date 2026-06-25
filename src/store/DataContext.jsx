import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { RESTAURANTES_SEED } from '../data/restaurantes.js'
import { CIDADES_SEED } from '../data/cidades.js'
import {
  AGENDAMENTOS_SEED,
  FOTOS_SEED,
  NOTAS_PRIVADAS_SEED,
  RELATORIOS_SEED,
} from '../data/agendamentos.js'
import { MATERIAIS_SEED } from '../data/materiais.js'
import { RECEITAS_DEMO_SEED, AULAS_DEMO_SEED } from '../data/conteudoDemo.js'

// ATENÇÃO: este contexto é só da DEMONSTRAÇÃO clicável (dados de mentira no
// localStorage). NÃO é segurança real — qualquer um com devtools lê tudo.
// Os filtros de privacidade abaixo apenas espelham como ficará no Supabase (RLS).
const STORAGE_KEY = 'ics-demo-data-v1'

const DataContext = createContext(null)

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

function estadoInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const salvo = JSON.parse(raw)
      // Garante chaves novas (receitas/aulas) em sessões antigas já salvas.
      return {
        ...salvo,
        receitas: salvo.receitas ?? RECEITAS_DEMO_SEED,
        aulas: salvo.aulas ?? AULAS_DEMO_SEED,
      }
    }
  } catch {
    // ignora dado corrompido e recarrega do seed
  }
  return {
    cidades: CIDADES_SEED,
    restaurantes: RESTAURANTES_SEED,
    agendamentos: AGENDAMENTOS_SEED,
    fotos: FOTOS_SEED,
    materiais: MATERIAIS_SEED,
    notasPrivadas: Object.fromEntries(NOTAS_PRIVADAS_SEED.map((n) => [n.agendamentoId, n.texto])),
    relatorios: Object.fromEntries(RELATORIOS_SEED.map((r) => [r.agendamentoId, r.texto])),
    receitas: RECEITAS_DEMO_SEED,
    aulas: AULAS_DEMO_SEED,
  }
}

export function DataProvider({ children }) {
  const [estado, setEstado] = useState(estadoInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  }, [estado])

  function resetarDemo() {
    localStorage.removeItem(STORAGE_KEY)
    setEstado(estadoInicial())
  }

  const api = useMemo(() => {
    const { cidades, restaurantes, agendamentos, fotos, materiais, notasPrivadas, relatorios, receitas, aulas } = estado

    // ---- Lookups ----
    const cidadeById = (id) => cidades.find((c) => c.id === id) || null
    const restauranteById = (id) => restaurantes.find((r) => r.id === id) || null
    const agendamentoById = (id) => agendamentos.find((a) => a.id === id) || null
    const materialById = (id) => materiais.find((m) => m.id === id) || null

    const restaurantesDaCidade = (cidadeId) => restaurantes.filter((r) => r.cidadeId === cidadeId)
    const restaurantesDoChef = (chefId) => restaurantes.filter((r) => r.chefId === chefId)

    const agendamentosDoRestaurante = (restauranteId) =>
      agendamentos
        .filter((a) => a.restauranteId === restauranteId)
        .sort((a, b) => (a.diasPlanejados[0]?.data || '').localeCompare(b.diasPlanejados[0]?.data || ''))

    const agendamentosDoChef = (chefId) =>
      agendamentos
        .filter((a) => a.chefId === chefId)
        .sort((a, b) => (a.diasPlanejados[0]?.data || '').localeCompare(b.diasPlanejados[0]?.data || ''))

    // REGRA: máximo 2 restaurantes por chef por dia (consultoria 8-10h em até 2 dias)
    function consultoriasDoChefNoDia(chefId, data, ignorarAgendamentoId = null) {
      const restaurantesNoDia = new Set()
      agendamentos.forEach((a) => {
        if (a.chefId !== chefId || a.status === 'cancelado' || a.id === ignorarAgendamentoId) return
        if (a.diasPlanejados.some((d) => d.data === data)) restaurantesNoDia.add(a.restauranteId)
      })
      return restaurantesNoDia.size
    }

    // ---- Mutações ----
    function addCidade(nome, estadoUf = 'PE') {
      const nova = { id: 'cid' + Date.now(), nome, estado: estadoUf, criadoEm: hoje() }
      setEstado((prev) => ({ ...prev, cidades: [...prev.cidades, nova] }))
      return nova
    }

    function addRestaurante(dados) {
      const novo = {
        id: 'r' + Date.now(),
        status: 'prospect',
        chefId: null,
        captadoPorId: 'captacao',
        criadoEm: hoje(),
        ...dados,
      }
      setEstado((prev) => ({ ...prev, restaurantes: [novo, ...prev.restaurantes] }))
      return novo
    }

    // Diretor distribui o restaurante para um chef
    function atribuirChef(restauranteId, chefId) {
      setEstado((prev) => ({
        ...prev,
        restaurantes: prev.restaurantes.map((r) =>
          r.id === restauranteId ? { ...r, chefId, status: r.status === 'prospect' ? 'cliente' : r.status } : r
        ),
      }))
    }

    // Chef cria o agendamento (após combinar via WhatsApp)
    function addAgendamento(dados) {
      const novo = { id: 'a' + Date.now(), status: 'agendado', dataProximoSugerida: null, ...dados }
      setEstado((prev) => ({ ...prev, agendamentos: [novo, ...prev.agendamentos] }))
      return novo
    }

    // Fotos "enviadas" são simuladas — guardamos só rótulo e tipo (sem imagem real).
    function addFoto(agendamentoId, tipo, label) {
      const nova = { id: 'f' + Date.now() + Math.random().toString(36).slice(2, 6), agendamentoId, tipo, label, criadaEm: hoje() }
      setEstado((prev) => ({ ...prev, fotos: [...prev.fotos, nova] }))
      return nova
    }

    function setNotaPrivada(agendamentoId, texto) {
      setEstado((prev) => ({ ...prev, notasPrivadas: { ...prev.notasPrivadas, [agendamentoId]: texto } }))
    }
    function setRelatorio(agendamentoId, texto) {
      setEstado((prev) => ({ ...prev, relatorios: { ...prev.relatorios, [agendamentoId]: texto } }))
    }

    function finalizarConsultoria(agendamentoId, { proximaData } = {}) {
      setEstado((prev) => ({
        ...prev,
        agendamentos: prev.agendamentos.map((a) =>
          a.id === agendamentoId
            ? { ...a, status: 'realizado', dataProximoSugerida: proximaData || a.dataProximoSugerida }
            : a
        ),
      }))
    }

    function shareMaterial(materialId, restauranteId) {
      setEstado((prev) => ({
        ...prev,
        materiais: prev.materiais.map((m) =>
          m.id === materialId && !m.compartilhadoCom.includes(restauranteId)
            ? { ...m, compartilhadoCom: [...m.compartilhadoCom, restauranteId] }
            : m
        ),
      }))
    }
    const materiaisDoRestaurante = (restauranteId) =>
      materiais.filter((m) => m.compartilhadoCom.includes(restauranteId))

    // ---- Receitas (demo) ----
    const receitaById = (id) => receitas.find((r) => r.id === id) || null
    function salvarReceita(dados) {
      if (dados.id) {
        setEstado((prev) => ({ ...prev, receitas: prev.receitas.map((r) => (r.id === dados.id ? { ...r, ...dados } : r)) }))
        return dados
      }
      const nova = { id: 'rec' + Date.now(), publicada: true, ...dados }
      setEstado((prev) => ({ ...prev, receitas: [nova, ...prev.receitas] }))
      return nova
    }
    function excluirReceita(id) {
      setEstado((prev) => ({ ...prev, receitas: prev.receitas.filter((r) => r.id !== id) }))
    }

    // ---- Aulas & cursos (demo) ----
    const aulaById = (id) => aulas.find((a) => a.id === id) || null
    function salvarAula(dados) {
      if (dados.id) {
        setEstado((prev) => ({ ...prev, aulas: prev.aulas.map((a) => (a.id === dados.id ? { ...a, ...dados } : a)) }))
        return dados
      }
      const nova = { id: 'aula' + Date.now(), publicada: true, ...dados }
      setEstado((prev) => ({ ...prev, aulas: [nova, ...prev.aulas] }))
      return nova
    }
    function excluirAula(id) {
      setEstado((prev) => ({ ...prev, aulas: prev.aulas.filter((a) => a.id !== id) }))
    }

    // ---- Filtros de privacidade (ponto único) ----
    function getFotosVisiveis(agendamentoId, session) {
      const ag = agendamentoById(agendamentoId)
      if (!ag || !session) return []
      const todas = fotos.filter((f) => f.agendamentoId === agendamentoId)
      if (session.role === 'luciano') return todas
      if (session.role === 'chef' && session.chefId === ag.chefId) return todas
      if (session.role === 'cliente' && session.restauranteId === ag.restauranteId) {
        return todas.filter((f) => f.tipo === 'compartilhada')
      }
      return []
    }
    function podeVerNotaPrivada(agendamentoId, session) {
      const ag = agendamentoById(agendamentoId)
      if (!ag || !session) return false
      if (session.role === 'luciano') return true
      if (session.role === 'chef' && session.chefId === ag.chefId) return true
      return false
    }
    function getNotaPrivada(agendamentoId, session) {
      if (!podeVerNotaPrivada(agendamentoId, session)) return null
      return notasPrivadas[agendamentoId] || ''
    }
    const getRelatorio = (agendamentoId) => relatorios[agendamentoId] || ''

    return {
      cidades, restaurantes, agendamentos, fotos, materiais, receitas, aulas,
      cidadeById, restauranteById, agendamentoById, materialById, receitaById, aulaById,
      restaurantesDaCidade, restaurantesDoChef,
      agendamentosDoRestaurante, agendamentosDoChef, consultoriasDoChefNoDia,
      addCidade, addRestaurante, atribuirChef, addAgendamento, addFoto,
      setNotaPrivada, setRelatorio, finalizarConsultoria,
      shareMaterial, materiaisDoRestaurante,
      salvarReceita, excluirReceita, salvarAula, excluirAula,
      getFotosVisiveis, podeVerNotaPrivada, getNotaPrivada, getRelatorio,
      resetarDemo,
    }
  }, [estado])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData precisa estar dentro de DataProvider')
  return ctx
}
