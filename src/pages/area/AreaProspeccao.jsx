import { useEffect, useState } from 'react'
import { useAuth } from '../../store/AuthContext.jsx'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { STATUS_RESTAURANTE, ORIGENS, TIPOS_ESTAB, labelStatusRestaurante } from '../../data/opcoes.js'
import { fmtCpf, fmtData } from '../../utils/formatters.js'
import { buscarCep, fmtCep, montarEndereco } from '../../utils/cep.js'

// Prospecção real da Captação (Josélia): cadastra restaurantes prospectados,
// vinculados a uma cidade, com captado_por = ela. Edita/exclui só os próprios
// (RLS restaurantes_captacao_*). A distribuição a chef continua sendo do diretor.

const VAZIO = {
  nome: '', cidade_id: '', tipo: 'Restaurante', origem: 'Prospecção do Instituto',
  responsavel: '', contato: '', cep: '', endereco: '', cnpj: '', cpf: '', observacoes: '',
}

export default function AreaProspeccao() {
  const { perfil } = useAuth()
  const [cidades, setCidades] = useState([])
  const [prospects, setProspects] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [edita, setEdita] = useState(null)        // null | 'novo' | id em edição
  const [form, setForm] = useState(VAZIO)
  const [numero, setNumero] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const cidadesPorId = Object.fromEntries(cidades.map((c) => [c.id, c.nome]))

  async function carregar() {
    setCarregando(true)
    const [{ data: cids }, { data: rs }] = await Promise.all([
      supabase.from('cidades').select('id,nome,estado').order('nome'),
      supabase.from('restaurantes').select('*').eq('captado_por', perfil?.id).order('criado_em', { ascending: false }),
    ])
    setCidades(cids || [])
    setProspects(rs || [])
    setCarregando(false)
  }
  useEffect(() => { if (perfil?.id) carregar() }, [perfil?.id])

  function campo(k) {
    return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) }
  }

  async function aoSairDoCep() {
    if (!form.cep || buscandoCep) return
    setBuscandoCep(true)
    const r = await buscarCep(form.cep)
    setBuscandoCep(false)
    if (r.erro) { showToast(r.erro, '⚠️'); return }
    setForm((p) => ({ ...p, endereco: montarEndereco(r, numero) }))
    showToast('Endereço preenchido pelo CEP.', '✓')
  }

  function abrirNovo() { setForm(VAZIO); setNumero(''); setEdita('novo') }
  function abrirEdicao(r) {
    setForm({
      nome: r.nome || '', cidade_id: r.cidade_id || '', tipo: r.tipo || 'Restaurante',
      origem: r.origem || 'Prospecção do Instituto', responsavel: r.responsavel || '',
      contato: r.contato || '', cep: r.cep || '', endereco: r.endereco || '',
      cnpj: r.cnpj || '', cpf: r.cpf || '', observacoes: r.observacoes || '',
    })
    setNumero('')
    setEdita(r.id)
  }

  async function salvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) { showToast('Informe o nome do restaurante.', '⚠️'); return }
    if (!form.cidade_id) { showToast('Selecione a cidade de atendimento.', '⚠️'); return }
    setSalvando(true)
    const payload = { ...form, captado_por: perfil.id }
    const resp = edita === 'novo'
      ? await supabase.from('restaurantes').insert({ ...payload, status: 'prospect' })
      : await supabase.from('restaurantes').update(payload).eq('id', edita)
    setSalvando(false)
    if (resp.error) { showToast('Erro ao salvar: ' + resp.error.message, '⚠️'); return }
    showToast(edita === 'novo' ? 'Prospect registrado.' : 'Prospect atualizado.', '✓')
    setEdita(null); setForm(VAZIO); carregar()
  }

  async function excluir(r) {
    if (!confirm(`Excluir o prospect "${r.nome}"?`)) return
    const { error } = await supabase.from('restaurantes').delete().eq('id', r.id)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { showToast('Prospect excluído.', '✓'); carregar() }
  }

  if (carregando) {
    return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Prospecção" voltar="/area" /><p className="text-sm text-ics-cinza py-10 text-center">Carregando…</p></div>)
  }

  // Formulário (novo/edição) em tela cheia
  if (edita) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo={edita === 'novo' ? 'Novo prospect' : 'Editar prospect'} voltar={() => setEdita(null)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={salvar} className="flex flex-col gap-3">
            <input className="ics-input" placeholder="Nome do restaurante" {...campo('nome')} />
            <select className="ics-input" {...campo('cidade_id')}>
              <option value="">Cidade de atendimento…</option>
              {cidades.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.estado ? `/${c.estado}` : ''}</option>)}
            </select>
            <div className="flex gap-3">
              <select className="ics-input flex-1" {...campo('tipo')}>{TIPOS_ESTAB.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <select className="ics-input flex-1" {...campo('origem')}>{ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
            </div>
            <input className="ics-input" placeholder="Responsável no local" {...campo('responsavel')} />
            <input className="ics-input" placeholder="Contato (WhatsApp)" {...campo('contato')} />
            <div className="flex gap-3">
              <input
                className="ics-input flex-1" placeholder="CEP" inputMode="numeric"
                value={form.cep}
                onChange={(e) => setForm((p) => ({ ...p, cep: fmtCep(e.target.value) }))}
                onBlur={aoSairDoCep}
              />
              <input className="ics-input w-24" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            {buscandoCep && <p className="text-xs text-ics-cinza -mt-2">Buscando endereço…</p>}
            <input className="ics-input" placeholder="Endereço (preenchido pelo CEP, pode editar)" {...campo('endereco')} />
            <div className="flex gap-3">
              <input className="ics-input flex-1" placeholder="CNPJ (opcional)" {...campo('cnpj')} />
              <input className="ics-input flex-1" placeholder="CPF (opcional)" {...campo('cpf')} />
            </div>
            <textarea className="ics-input min-h-16" placeholder="Observações (como foi o contato, interesse…)" {...campo('observacoes')} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEdita(null)} className="flex-1 border border-black/15 rounded-xl py-3 font-medium">Cancelar</button>
              <button type="submit" disabled={salvando} className="flex-1 bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">{salvando ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Prospecção" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-title text-base font-semibold">Meus prospects ({prospects.length})</h2>
          <button onClick={abrirNovo} className="text-sm font-semibold text-white bg-ics-preto rounded-full px-3.5 py-1.5">+ Prospect</button>
        </div>

        {cidades.length === 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3.5 py-2.5 mb-3">
            Nenhuma cidade de atendimento cadastrada ainda. O diretor precisa criar as cidades antes da prospecção.
          </p>
        )}

        {prospects.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Você ainda não cadastrou nenhum prospect. Toque em “+ Prospect”.</p>}

        <div className="flex flex-col gap-2.5">
          {prospects.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{r.nome}</p>
                  <p className="text-sm text-ics-cinza">{[cidadesPorId[r.cidade_id], r.tipo].filter(Boolean).join(' · ')}</p>
                  {(r.responsavel || r.contato) && <p className="text-sm text-ics-cinza">{[r.responsavel, r.contato].filter(Boolean).join(' — ')}</p>}
                  {(r.cnpj || r.cpf) && <p className="text-xs text-ics-cinza">{[r.cnpj && `CNPJ ${r.cnpj}`, r.cpf && `CPF ${fmtCpf(r.cpf)}`].filter(Boolean).join(' · ')}</p>}
                  <p className="text-xs text-ics-dourado font-medium mt-0.5">{labelStatusRestaurante(r.status)}</p>
                  {r.criado_em && <p className="text-xs text-ics-cinza">Prospectado em {fmtData(String(r.criado_em).slice(0, 10))}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => abrirEdicao(r)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Editar</button>
                  <button onClick={() => excluir(r)} className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2.5 py-1">Excluir</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
