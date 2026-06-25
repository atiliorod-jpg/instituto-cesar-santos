import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { STATUS_CIDADE } from '../../data/opcoes.js'
import { fmtData } from '../../utils/formatters.js'

const ANO_ATUAL = new Date().getFullYear()

export default function AreaCidades() {
  const [cidades, setCidades] = useState([])
  const [contagem, setContagem] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [anoFiltro, setAnoFiltro] = useState(ANO_ATUAL)
  const [form, setForm] = useState({ nome: '', estado: 'PE', status: 'Planejamento', data_limite: '', observacoes: '' })
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data: cids } = await supabase.from('cidades').select('*').order('criado_em', { ascending: false })
    const { data: rests } = await supabase.from('restaurantes').select('cidade_id')
    const cont = {}
    ;(rests || []).forEach((r) => { cont[r.cidade_id] = (cont[r.cidade_id] || 0) + 1 })
    setCidades(cids || [])
    setContagem(cont)
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function campo(k) {
    return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) }
  }

  // Anos disponíveis: os já existentes nas cidades + o ano atual (sempre presente).
  const anos = useMemo(() => {
    const set = new Set([ANO_ATUAL])
    cidades.forEach((c) => set.add(c.ano || ANO_ATUAL))
    return [...set].sort((a, b) => b - a)
  }, [cidades])

  const cidadesDoAno = useMemo(
    () => cidades.filter((c) => (c.ano || ANO_ATUAL) === anoFiltro),
    [cidades, anoFiltro]
  )

  async function criar(e) {
    e.preventDefault()
    if (!form.nome.trim()) { showToast('Informe o nome da cidade.', '⚠️'); return }
    setSalvando(true)
    // Cidade nasce no ano selecionado, com a data de início = hoje (data de criação).
    const payload = {
      ...form, data_limite: form.data_limite || null,
      ano: anoFiltro, data_inicio: new Date().toISOString().slice(0, 10),
    }
    const { error } = await supabase.from('cidades').insert(payload)
    setSalvando(false)
    if (error) { showToast('Erro ao salvar: ' + error.message, '⚠️'); return }
    showToast('Cidade criada.', '✓')
    setForm({ nome: '', estado: 'PE', status: 'Planejamento', data_limite: '', observacoes: '' })
    setMostrarForm(false)
    carregar()
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Cidades de atendimento" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <label className="text-sm text-ics-cinza font-medium flex items-center gap-2">
            Ano
            <select className="ics-input py-2" value={anoFiltro} onChange={(e) => setAnoFiltro(Number(e.target.value))}>
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <span className="text-xs text-ics-cinza">{cidadesDoAno.length} cidade{cidadesDoAno.length === 1 ? '' : 's'} em {anoFiltro}</span>
        </div>
        <button onClick={() => setMostrarForm((v) => !v)} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">
          {mostrarForm ? 'Cancelar' : `+ Nova cidade em ${anoFiltro}`}
        </button>

        {mostrarForm && (
          <Card className="mb-5">
            <form onSubmit={criar} className="flex flex-col gap-3">
              <input className="ics-input" placeholder="Nome da cidade" {...campo('nome')} />
              <div className="flex gap-3">
                <input className="ics-input w-24" placeholder="UF" {...campo('estado')} />
                <select className="ics-input flex-1" {...campo('status')}>
                  {STATUS_CIDADE.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <label className="text-sm text-ics-cinza font-medium">Data limite de conclusão
                <input type="date" className="ics-input mt-1" {...campo('data_limite')} />
              </label>
              <textarea className="ics-input min-h-20" placeholder="Observações" {...campo('observacoes')} />
              <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
                {salvando ? 'Salvando…' : 'Criar cidade'}
              </button>
            </form>
          </Card>
        )}

        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && cidadesDoAno.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhuma cidade em {anoFiltro}. Crie a primeira acima.</p>}

        <div className="flex flex-col gap-2.5">
          {cidadesDoAno.map((c) => (
            <Card key={c.id}>
              <Link to={`/area/cidades/${c.id}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.nome} <span className="text-ics-cinza font-normal">· {c.estado}</span></p>
                  <p className="text-sm text-ics-cinza">
                    {(contagem[c.id] || 0)} restaurante{(contagem[c.id] || 0) === 1 ? '' : 's'}
                    {c.data_limite ? ` · limite ${fmtData(c.data_limite)}` : ''}
                  </p>
                </div>
                <span className="badge badge-grey flex-shrink-0">{c.status || '—'}</span>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
