import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../store/AuthContext.jsx'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import { showToast } from '../../utils/toast.js'
import { fmtData } from '../../utils/formatters.js'

function primeiraData(dias) {
  if (!Array.isArray(dias) || !dias.length) return null
  return dias[0]?.data || null
}

export default function AreaConsultorias() {
  const { perfil } = useAuth()
  const chefId = perfil?.chef_id
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [ags, setAgs] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ restaurante_id: '', data: '', periodo: 'Manhã' })

  async function carregar() {
    setCarregando(true)
    const [{ data: a }, { data: rs }] = await Promise.all([
      supabase.from('agendamentos').select('id,status,dias,data_proximo,restaurantes(nome)').order('criado_em', { ascending: false }),
      supabase.from('restaurantes').select('id,nome').order('nome'),
    ])
    setAgs(a || [])
    setRestaurantes(rs || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  // Pré-seleciona restaurante quando vem de "Agendar consultoria"
  useEffect(() => {
    const rid = params.get('restaurante')
    if (rid) { setForm((f) => ({ ...f, restaurante_id: rid })); setCriando(true) }
  }, [params])

  const lista = useMemo(
    () => [...ags].sort((a, b) => (primeiraData(b.dias) || '').localeCompare(primeiraData(a.dias) || '')),
    [ags]
  )

  async function criar(e) {
    e.preventDefault()
    if (!form.restaurante_id) { showToast('Escolha o restaurante.', '⚠️'); return }
    if (!form.data) { showToast('Escolha a data.', '⚠️'); return }
    setSalvando(true)
    const payload = {
      restaurante_id: form.restaurante_id,
      chef_id: chefId,
      status: 'agendado',
      dias: [{ data: form.data, periodo: form.periodo }],
    }
    const { data, error } = await supabase.from('agendamentos').insert(payload).select('id').single()
    setSalvando(false)
    if (error) { showToast('Erro: ' + error.message, '⚠️'); return }
    showToast('Consultoria agendada.', '✓')
    setCriando(false); setForm({ restaurante_id: '', data: '', periodo: 'Manhã' })
    navigate(`/area/consultorias/${data.id}`)
  }

  if (criando) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo="Nova consultoria" voltar={() => setCriando(false)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={criar} className="flex flex-col gap-3">
            <label className="text-sm text-ics-cinza font-medium">Restaurante
              <select className="ics-input mt-1" value={form.restaurante_id} onChange={(e) => setForm((f) => ({ ...f, restaurante_id: e.target.value }))}>
                <option value="">Escolha…</option>
                {restaurantes.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
            </label>
            <div className="flex gap-3">
              <label className="text-sm text-ics-cinza font-medium flex-1">Data
                <input type="date" className="ics-input mt-1" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
              </label>
              <label className="text-sm text-ics-cinza font-medium flex-1">Período
                <select className="ics-input mt-1" value={form.periodo} onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value }))}>
                  <option>Manhã</option><option>Tarde</option><option>Dia inteiro</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
              {salvando ? 'Agendando…' : 'Agendar consultoria'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Minhas consultorias" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button onClick={() => setCriando(true)} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">+ Nova consultoria</button>
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && lista.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhuma consultoria ainda.</p>}
        <div className="flex flex-col gap-2.5">
          {lista.map((a) => (
            <Card key={a.id} onClick={() => navigate(`/area/consultorias/${a.id}`)} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{a.restaurantes?.nome || 'Restaurante'}</p>
                <p className="text-sm text-ics-cinza truncate">{primeiraData(a.dias) ? fmtData(primeiraData(a.dias)) : 'Sem data'}</p>
              </div>
              <Badge status={a.status} />
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
