import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { fmtData } from '../../utils/formatters.js'

const VAZIO = {
  tipo: 'aula_show', titulo: '', cidade: '', data: '', hora: '', local: '',
  descricao: '', video_url: '', chef_id: '', chef_nome: '', receita_id: '', publicada: true,
}

export default function AreaAulas() {
  const [aulas, setAulas] = useState([])
  const [chefs, setChefs] = useState([])
  const [receitas, setReceitas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null) // null | 'novo' | objeto
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const [{ data: a }, { data: c }, { data: r }] = await Promise.all([
      supabase.from('aulas').select('*, chefs(nome)').order('data', { ascending: false }),
      supabase.from('chefs').select('id,nome').eq('ativo', true).order('nome'),
      supabase.from('receitas').select('id,titulo').order('titulo'),
    ])
    setAulas(a || []); setChefs(c || []); setReceitas(r || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() { setForm(VAZIO); setEditando('novo') }
  function abrirEdicao(a) {
    setForm({ tipo: a.tipo || 'aula_show', titulo: a.titulo || '', cidade: a.cidade || '', data: a.data || '', hora: a.hora || '', local: a.local || '', descricao: a.descricao || '', video_url: a.video_url || '', chef_id: a.chef_id || '', chef_nome: a.chef_nome || '', receita_id: a.receita_id || '', publicada: !!a.publicada })
    setEditando(a)
  }
  function campo(k) { return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) } }

  async function salvar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { showToast('Informe o título.', '⚠️'); return }
    setSalvando(true)
    const payload = { ...form, data: form.data || null, chef_id: form.chef_id || null, chef_nome: form.chef_nome.trim() || null, receita_id: form.receita_id || null }
    const resp = editando === 'novo'
      ? await supabase.from('aulas').insert(payload)
      : await supabase.from('aulas').update(payload).eq('id', editando.id)
    setSalvando(false)
    if (resp.error) { showToast('Erro: ' + resp.error.message, '⚠️'); return }
    showToast('Aula salva.', '✓'); setEditando(null); carregar()
  }

  async function excluir(a) {
    if (!confirm('Excluir esta aula?')) return
    const { error } = await supabase.from('aulas').delete().eq('id', a.id)
    if (error) showToast('Erro: ' + error.message, '⚠️')
    else { showToast('Excluída.', '✓'); carregar() }
  }

  if (editando) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo={editando === 'novo' ? 'Nova aula' : 'Editar aula'} voltar={() => setEditando(null)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={salvar} className="flex flex-col gap-3">
            <select className="ics-input" {...campo('tipo')}>
              <option value="aula_show">Aula show</option>
              <option value="curso">Curso</option>
            </select>
            <input className="ics-input" placeholder="Título" {...campo('titulo')} />
            <div className="flex gap-3">
              <input className="ics-input flex-1" placeholder="Cidade" {...campo('cidade')} />
              <input type="date" className="ics-input flex-1" {...campo('data')} />
            </div>
            <div className="flex gap-3">
              <input className="ics-input flex-1" placeholder="Hora (ex: 18h)" {...campo('hora')} />
              <input className="ics-input flex-1" placeholder="Local" {...campo('local')} />
            </div>
            <select className="ics-input" {...campo('chef_id')}>
              <option value="">Chef da equipe (opcional)…</option>
              {chefs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <input className="ics-input" placeholder="Ou digite o chef responsável (se não for da equipe)" {...campo('chef_nome')} />
            <select className="ics-input" {...campo('receita_id')}>
              <option value="">Vincular receita (opcional)…</option>
              {receitas.map((r) => <option key={r.id} value={r.id}>{r.titulo}</option>)}
            </select>
            <input className="ics-input" placeholder="Link do vídeo (YouTube/Vimeo)" {...campo('video_url')} />
            <textarea className="ics-input min-h-24" placeholder="Descrição" {...campo('descricao')} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.publicada} onChange={(e) => setForm((p) => ({ ...p, publicada: e.target.checked }))} />
              Publicada (aparece no site público)
            </label>
            <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
              {salvando ? 'Salvando…' : 'Salvar aula'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Aulas & Cursos" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button onClick={abrirNovo} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">+ Nova aula / curso</button>
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && aulas.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhuma aula cadastrada ainda.</p>}
        <div className="flex flex-col gap-2.5">
          {aulas.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-ics-dourado font-semibold uppercase">{a.tipo === 'curso' ? 'Curso' : 'Aula show'}{!a.publicada ? ' · rascunho' : ''}</p>
                  <p className="font-semibold truncate">{a.titulo}</p>
                  <p className="text-sm text-ics-cinza truncate">{[a.chefs?.nome || a.chef_nome, a.cidade, a.data && fmtData(a.data)].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => abrirEdicao(a)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Editar</button>
                  <button onClick={() => excluir(a)} className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2.5 py-1">Excluir</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
