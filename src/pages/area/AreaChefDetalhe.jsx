import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import { showToast } from '../../utils/toast.js'
import { STATUS_RESTAURANTE } from '../../data/opcoes.js'
import { fmtData, linkWhatsapp } from '../../utils/formatters.js'

function primeiraData(dias) {
  if (!Array.isArray(dias) || !dias.length) return null
  return dias[0]?.data || null
}

// Visão do diretor sobre a conta de UM chef: restaurantes dele + consultorias.
// Não é "logar como" o chef (inviável com segurança num site estático) — é o
// próprio diretor (que já tem acesso total via RLS) olhando e ajustando os
// dados desse chef. Qualquer ajuste de status/distribuição aqui notifica o
// chef automaticamente (gatilho no banco).
export default function AreaChefDetalhe() {
  const { id } = useParams()
  const [chef, setChef] = useState(null)
  const [restaurantes, setRestaurantes] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const [{ data: c }, { data: rs }, { data: ags }] = await Promise.all([
      supabase.from('chefs').select('*').eq('id', id).maybeSingle(),
      supabase.from('restaurantes').select('*').eq('chef_id', id).order('criado_em', { ascending: false }),
      supabase.from('agendamentos').select('id,status,dias,data_proximo,restaurantes(nome)').eq('chef_id', id),
    ])
    setChef(c); setRestaurantes(rs || []); setAgendamentos(ags || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [id])

  async function atualizarRest(rid, patch) {
    const { error } = await supabase.from('restaurantes').update(patch).eq('id', rid)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { setRestaurantes((list) => list.map((r) => (r.id === rid ? { ...r, ...patch } : r))); showToast('Atualizado — o chef foi avisado.', '✓') }
  }

  if (carregando) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Chef" voltar="/area/chefs" /><p className="text-sm text-ics-cinza py-10 text-center">Carregando…</p></div>)
  if (!chef) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Chef" voltar="/area/chefs" /><p className="text-sm text-ics-cinza py-10 text-center">Chef não encontrado.</p></div>)

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo={chef.nome} voltar="/area/chefs" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-amber-50 text-amber-800 text-xs rounded-xl px-3.5 py-2.5 mb-4">
          Visualizando a conta de <strong>{chef.nome}</strong>. Qualquer mudança feita aqui avisa o chef automaticamente.
        </div>

        <Card className="mb-5 flex items-center gap-3">
          {chef.foto_url ? (
            <img src={chef.foto_url} alt={chef.nome} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-ics-preto text-white flex items-center justify-center font-title flex-shrink-0">
              {chef.iniciais || chef.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{chef.nome}</p>
            <p className="text-sm text-ics-cinza truncate">{[chef.cargo, chef.especialidade].filter(Boolean).join(' · ')}</p>
          </div>
          {linkWhatsapp(chef.whatsapp) && (
            <a href={linkWhatsapp(chef.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#128C7E] border border-[#25D366]/40 rounded-full px-3 py-1.5 flex-shrink-0">WhatsApp</a>
          )}
        </Card>

        <h2 className="font-title text-base font-semibold mb-2.5">Restaurantes ({restaurantes.length})</h2>
        {restaurantes.length === 0 && <p className="text-sm text-ics-cinza py-3">Nenhum restaurante distribuído a este chef ainda.</p>}
        <div className="flex flex-col gap-2.5 mb-6">
          {restaurantes.map((r) => (
            <Card key={r.id}>
              <p className="font-semibold">{r.nome}</p>
              <p className="text-sm text-ics-cinza">{[r.tipo, r.responsavel].filter(Boolean).join(' · ')}</p>
              <label className="text-xs text-ics-cinza block mt-2">Status
                <select className="ics-input mt-0.5 text-sm" value={r.status || 'prospect'} onChange={(e) => atualizarRest(r.id, { status: e.target.value })}>
                  {STATUS_RESTAURANTE.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </label>
            </Card>
          ))}
        </div>

        <h2 className="font-title text-base font-semibold mb-2.5">Consultorias ({agendamentos.length})</h2>
        {agendamentos.length === 0 && <p className="text-sm text-ics-cinza py-3">Nenhuma consultoria agendada ainda.</p>}
        <div className="flex flex-col gap-2.5">
          {agendamentos.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{a.restaurantes?.nome || 'Restaurante'}</p>
                <p className="text-sm text-ics-cinza truncate">{primeiraData(a.dias) && fmtData(primeiraData(a.dias))}</p>
              </div>
              <Badge status={a.status} />
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
