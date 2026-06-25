import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { STATUS_CIDADE, STATUS_RESTAURANTE, ORIGENS, TIPOS_ESTAB } from '../../data/opcoes.js'
import { fmtCpf, fmtData } from '../../utils/formatters.js'
import { buscarCep, fmtCep, montarEndereco } from '../../utils/cep.js'
import { baixarRelatorioCidade } from '../../utils/cidadeRelatorio.js'

const REST_VAZIO = {
  nome: '', tipo: 'Restaurante', origem: 'Prospecção do Instituto', responsavel: '',
  contato: '', cep: '', endereco: '', cnpj: '', cpf: '', observacoes: '', chef_id: '', status: 'prospect',
}

export default function AreaCidadeDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cidade, setCidade] = useState(null)
  const [restaurantes, setRestaurantes] = useState([])
  const [chefs, setChefs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [edita, setEdita] = useState(null) // null | 'novo' | id do restaurante em edição
  const [form, setForm] = useState(REST_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [numero, setNumero] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [gerandoRel, setGerandoRel] = useState(false)

  async function gerarRelatorio() {
    setGerandoRel(true)
    try {
      const chefsPorId = Object.fromEntries(chefs.map((c) => [c.id, c.nome]))
      await baixarRelatorioCidade({ cidade, restaurantes, chefsPorId })
    } catch { showToast('Erro ao gerar o relatório.', '⚠️') }
    setGerandoRel(false)
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

  async function carregar() {
    setCarregando(true)
    const [{ data: cid }, { data: rs }, { data: cfs }] = await Promise.all([
      supabase.from('cidades').select('*').eq('id', id).maybeSingle(),
      supabase.from('restaurantes').select('*').eq('cidade_id', id).order('criado_em', { ascending: false }),
      supabase.from('chefs').select('id,nome,slug').eq('ativo', true).order('nome'),
    ])
    setCidade(cid)
    setRestaurantes(rs || [])
    setChefs((cfs || []).filter((c) => !['cesar-santos', 'luciano-roberto', 'joselia-maria'].includes(c.slug)))
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [id])

  async function salvarCidade(patch) {
    const { error } = await supabase.from('cidades').update(patch).eq('id', id)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { setCidade((c) => ({ ...c, ...patch })); showToast('Cidade atualizada.', '✓') }
  }

  async function excluirCidade() {
    if (!confirm(`Excluir a cidade "${cidade.nome}"? Os restaurantes dela ficarão sem cidade.`)) return
    const { error } = await supabase.from('cidades').delete().eq('id', id)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { showToast('Cidade excluída.', '✓'); navigate('/area/cidades') }
  }

  function campo(k) {
    return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) }
  }
  function abrirNovo() { setForm(REST_VAZIO); setNumero(''); setEdita('novo') }
  function abrirEdicao(r) {
    setForm({
      nome: r.nome || '', tipo: r.tipo || 'Restaurante', origem: r.origem || 'Prospecção do Instituto',
      responsavel: r.responsavel || '', contato: r.contato || '', cep: r.cep || '', endereco: r.endereco || '',
      cnpj: r.cnpj || '', cpf: r.cpf || '', observacoes: r.observacoes || '', chef_id: r.chef_id || '', status: r.status || 'prospect',
    })
    setNumero('')
    setEdita(r.id)
  }

  async function salvarRestaurante(e) {
    e.preventDefault()
    if (!form.nome.trim()) { showToast('Informe o nome do restaurante.', '⚠️'); return }
    setSalvando(true)
    const payload = { ...form, cidade_id: id, chef_id: form.chef_id || null }
    const resp = edita === 'novo'
      ? await supabase.from('restaurantes').insert(payload)
      : await supabase.from('restaurantes').update(payload).eq('id', edita)
    setSalvando(false)
    if (resp.error) { showToast('Erro ao salvar: ' + resp.error.message, '⚠️'); return }
    showToast('Restaurante salvo.', '✓'); setEdita(null); setForm(REST_VAZIO); carregar()
  }

  async function excluirRestaurante(r) {
    if (!confirm(`Excluir o restaurante "${r.nome}"?`)) return
    const { error } = await supabase.from('restaurantes').delete().eq('id', r.id)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { showToast('Restaurante excluído.', '✓'); carregar() }
  }

  async function atualizarRest(rid, patch) {
    const { error } = await supabase.from('restaurantes').update(patch).eq('id', rid)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else setRestaurantes((list) => list.map((r) => (r.id === rid ? { ...r, ...patch } : r)))
  }

  function copiarLink(r) {
    if (!r.token) { showToast('Este restaurante ainda não tem link (rode a migração do banco).', '⚠️'); return }
    const url = `${window.location.origin}${import.meta.env.BASE_URL}r/${r.token}`
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copiado — envie para o restaurante.', '✓'))
      .catch(() => showToast(url, ''))
  }

  if (carregando) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Cidade" voltar="/area/cidades" /><p className="text-sm text-ics-cinza py-10 text-center">Carregando…</p></div>)
  if (!cidade) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Cidade" voltar="/area/cidades" /><p className="text-sm text-ics-cinza py-10 text-center">Cidade não encontrada.</p></div>)

  // Formulário de restaurante (novo ou edição) em tela cheia
  if (edita) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo={edita === 'novo' ? 'Novo restaurante' : 'Editar restaurante'} voltar={() => setEdita(null)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={salvarRestaurante} className="flex flex-col gap-3">
            <input className="ics-input" placeholder="Nome do restaurante" {...campo('nome')} />
            <div className="flex gap-3">
              <select className="ics-input flex-1" {...campo('tipo')}>{TIPOS_ESTAB.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <select className="ics-input flex-1" {...campo('origem')}>{ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
            </div>
            <input className="ics-input" placeholder="Responsável no local" {...campo('responsavel')} />
            <input className="ics-input" placeholder="Contato (WhatsApp)" {...campo('contato')} />
            <div className="flex gap-3">
              <input
                className="ics-input flex-1"
                placeholder="CEP"
                inputMode="numeric"
                value={form.cep}
                onChange={(e) => setForm((p) => ({ ...p, cep: fmtCep(e.target.value) }))}
                onBlur={aoSairDoCep}
              />
              <input
                className="ics-input w-24"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
            {buscandoCep && <p className="text-xs text-ics-cinza -mt-2">Buscando endereço…</p>}
            <input className="ics-input" placeholder="Endereço (rua, bairro, cidade — preenchido pelo CEP, pode editar)" {...campo('endereco')} />
            <div className="flex gap-3">
              <input className="ics-input flex-1" placeholder="CNPJ (opcional)" {...campo('cnpj')} />
              <input className="ics-input flex-1" placeholder="CPF (opcional)" {...campo('cpf')} />
            </div>
            <select className="ics-input" {...campo('chef_id')}>
              <option value="">Distribuir para um chef (opcional)…</option>
              {chefs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="ics-input" {...campo('status')}>
              {STATUS_RESTAURANTE.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <textarea className="ics-input min-h-16" placeholder="Observações" {...campo('observacoes')} />
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
      <AreaHeader titulo={cidade.nome} voltar="/area/cidades" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Edição da cidade */}
        <Card className="mb-5">
          <label className="text-sm text-ics-cinza font-medium">Nome da cidade
            <input className="ics-input mt-1" defaultValue={cidade.nome} onBlur={(e) => e.target.value.trim() && e.target.value !== cidade.nome && salvarCidade({ nome: e.target.value.trim() })} />
          </label>
          <div className="flex gap-3 items-end mt-3">
            <label className="text-sm text-ics-cinza font-medium flex-1">Status
              <select className="ics-input mt-1" value={cidade.status || 'Planejamento'} onChange={(e) => salvarCidade({ status: e.target.value })}>
                {STATUS_CIDADE.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-sm text-ics-cinza font-medium flex-1">Ano / ciclo
              <input type="number" className="ics-input mt-1" value={cidade.ano || ''} onChange={(e) => salvarCidade({ ano: Number(e.target.value) || null })} />
            </label>
          </div>
          <div className="flex gap-3 items-end mt-3">
            <label className="text-sm text-ics-cinza font-medium flex-1">Início do atendimento
              <input type="date" className="ics-input mt-1" value={cidade.data_inicio || ''} onChange={(e) => salvarCidade({ data_inicio: e.target.value || null })} />
            </label>
            <label className="text-sm text-ics-cinza font-medium flex-1">Data limite
              <input type="date" className="ics-input mt-1" value={cidade.data_limite || ''} onChange={(e) => salvarCidade({ data_limite: e.target.value || null })} />
            </label>
          </div>
          {cidade.criado_em && <p className="text-xs text-ics-cinza mt-3">Cidade cadastrada em {fmtData(String(cidade.criado_em).slice(0, 10))} de {String(cidade.criado_em).slice(0, 4)}</p>}
          <div className="flex items-center justify-between mt-3">
            <button onClick={excluirCidade} className="text-sm text-red-600 font-medium">Excluir cidade</button>
            <button onClick={gerarRelatorio} disabled={gerandoRel} className="text-sm font-semibold text-ics-preto border border-black/15 rounded-lg px-3 py-1.5 disabled:opacity-50">
              {gerandoRel ? 'Gerando…' : '⬇ Relatório completo (Word)'}
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-title text-base font-semibold">Restaurantes ({restaurantes.length})</h2>
          <button onClick={abrirNovo} className="text-sm font-semibold text-white bg-ics-preto rounded-full px-3.5 py-1.5">+ Restaurante</button>
        </div>

        {restaurantes.length === 0 && <p className="text-sm text-ics-cinza py-4 text-center">Nenhum restaurante nesta cidade ainda.</p>}

        <div className="flex flex-col gap-2.5">
          {restaurantes.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{r.nome}</p>
                  <p className="text-sm text-ics-cinza">{[r.tipo, r.origem].filter(Boolean).join(' · ')}</p>
                  {(r.responsavel || r.contato) && <p className="text-sm text-ics-cinza">{[r.responsavel, r.contato].filter(Boolean).join(' — ')}</p>}
                  {(r.cnpj || r.cpf) && <p className="text-xs text-ics-cinza">{[r.cnpj && `CNPJ ${r.cnpj}`, r.cpf && `CPF ${fmtCpf(r.cpf)}`].filter(Boolean).join(' · ')}</p>}
                  {r.criado_em && <p className="text-xs text-ics-cinza">Prospectado em {fmtData(String(r.criado_em).slice(0, 10))} de {String(r.criado_em).slice(0, 4)}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => abrirEdicao(r)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Editar</button>
                  <button onClick={() => copiarLink(r)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Link do cliente</button>
                  <button onClick={() => excluirRestaurante(r)} className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2.5 py-1">Excluir</button>
                </div>
              </div>
              <div className="flex gap-2 border-t border-black/5 pt-2.5 mt-2.5">
                <label className="text-xs text-ics-cinza flex-1">Chef
                  <select className="ics-input mt-0.5 text-sm" value={r.chef_id || ''} onChange={(e) => atualizarRest(r.id, { chef_id: e.target.value || null })}>
                    <option value="">— não distribuído —</option>
                    {chefs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </label>
                <label className="text-xs text-ics-cinza flex-1">Status
                  <select className="ics-input mt-0.5 text-sm" value={r.status || 'prospect'} onChange={(e) => atualizarRest(r.id, { status: e.target.value })}>
                    {STATUS_RESTAURANTE.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                </label>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
