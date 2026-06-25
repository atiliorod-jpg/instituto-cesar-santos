import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { useSession } from '../store/SessionContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { IconPhone } from '../components/Icons.jsx'
import { showToast } from '../utils/toast.js'

const PERIODOS = ['manhã', 'tarde']

export default function NovoAgendamento() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { session } = useSession()
  const { restaurantesDoChef, restauranteById, addAgendamento, consultoriasDoChefNoDia } = useData()

  const chefId = session.chefId
  const [restauranteId, setRestauranteId] = useState(params.get('restauranteId') || '')
  const [dias, setDias] = useState([{ data: '', periodo: 'manhã', horas: 5 }])

  // O chef só agenda restaurantes que o diretor distribuiu para ele.
  const meusRestaurantes = restaurantesDoChef(chefId).filter((r) => r.status !== 'inativo')
  const restauranteSelecionado = restauranteById(restauranteId)
  const telefoneLimpo = restauranteSelecionado?.contato?.replace(/\D/g, '') || ''

  function atualizarDia(i, campo, valor) {
    setDias((prev) => prev.map((d, idx) => (idx === i ? { ...d, [campo]: valor } : d)))
  }

  function adicionarDia() {
    if (dias.length >= 2) return
    setDias((prev) => [...prev, { data: '', periodo: 'manhã', horas: 5 }])
  }

  function removerDia(i) {
    setDias((prev) => prev.filter((_, idx) => idx !== i))
  }

  function avisoDoDia(data) {
    if (!chefId || !data) return null
    const n = consultoriasDoChefNoDia(chefId, data)
    if (n >= 2) return `Este chef já tem ${n} restaurantes agendados neste dia (máximo recomendado: 2).`
    if (n === 1) return 'Este chef já tem 1 restaurante agendado neste dia.'
    return null
  }

  function aoSubmeter(e) {
    e.preventDefault()
    if (!restauranteId || dias.some((d) => !d.data)) {
      showToast('Escolha o restaurante e todas as datas.', '⚠️')
      return
    }
    addAgendamento({ restauranteId, chefId, diasPlanejados: dias })
    showToast('Consultoria agendada com sucesso.', '✓')
    navigate(`/restaurantes/${restauranteId}`)
  }

  return (
    <Layout titulo="Nova consultoria" voltar={true}>
      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <Campo label="Restaurante (distribuídos a você)">
          <select className="ics-input" value={restauranteId} onChange={(e) => setRestauranteId(e.target.value)} required>
            <option value="">Selecione…</option>
            {meusRestaurantes.map((r) => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
        </Campo>

        {restauranteSelecionado && (
          <a
            href={`https://wa.me/55${telefoneLimpo.replace(/^55/, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-ics-preto font-medium bg-white border border-black/10 rounded-xl px-3.5 py-3"
          >
            <IconPhone width={18} height={18} />
            Combinar pelo WhatsApp — {restauranteSelecionado.responsavel}
          </a>
        )}

        <Card className="bg-ics-bege/60 text-sm text-ics-cinza">
          Consultoria total: 8 a 10 horas, divididas em até 2 dias flexíveis (ex.: 5h + 5h, ou 3h + 7h). Máximo de 2 restaurantes por dia.
        </Card>

        {dias.map((d, i) => {
          const aviso = avisoDoDia(d.data)
          return (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm">Dia {i + 1}</p>
                {dias.length > 1 && (
                  <button type="button" onClick={() => removerDia(i)} className="text-xs text-ics-cinza">Remover</button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Campo label="Data">
                  <input type="date" className="ics-input" value={d.data} onChange={(e) => atualizarDia(i, 'data', e.target.value)} required />
                </Campo>
                <div className="flex gap-3">
                  <Campo label="Período" className="flex-1">
                    <select className="ics-input" value={d.periodo} onChange={(e) => atualizarDia(i, 'periodo', e.target.value)}>
                      {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Horas" className="w-24">
                    <input type="number" min={1} max={10} className="ics-input" value={d.horas} onChange={(e) => atualizarDia(i, 'horas', Number(e.target.value))} />
                  </Campo>
                </div>
                {aviso && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">⚠️ {aviso}</p>}
              </div>
            </Card>
          )
        })}

        {dias.length < 2 && (
          <button type="button" onClick={adicionarDia} className="text-sm font-medium text-ics-preto self-start">
            + Adicionar segundo dia
          </button>
        )}

        <button type="submit" className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mt-2">
          Agendar consultoria
        </button>
      </form>
    </Layout>
  )
}

function Campo({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-ics-cinza font-medium">{label}</span>
      {children}
    </label>
  )
}
