import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'
import { baixarFichaTecnicaModelo } from '../../utils/fichaTecnicaWord.js'
import { parseReceitaWord } from '../../utils/receitaImportWord.js'

const CATEGORIAS = ['Entradas', 'Pratos principais', 'Acompanhamentos', 'Sobremesas', 'Bebidas']
const VAZIO = {
  titulo: '', categoria: 'Pratos principais', chef_id: '', autor: '', descricao: '',
  ingredientes: '', modo_preparo: '', tempo_preparo: '', rendimento: '', foto_url: '', publicada: true,
}
function semAcento(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() }

export default function AreaReceitas() {
  const [receitas, setReceitas] = useState([])
  const [chefs, setChefs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [baixandoModelo, setBaixandoModelo] = useState(false)
  const [importando, setImportando] = useState(false)
  const inputImportarRef = useRef(null)

  async function baixarModelo() {
    setBaixandoModelo(true)
    try { await baixarFichaTecnicaModelo() } catch { showToast('Erro ao gerar o modelo.', '⚠️') }
    setBaixandoModelo(false)
  }

  async function importarWord(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportando(true)
    try {
      const r = await parseReceitaWord(file)
      setForm({
        ...VAZIO,
        titulo: r.titulo,
        ingredientes: r.ingredientes,
        modo_preparo: r.modo_preparo,
        descricao: r.observacoes || '',
      })
      setEditando('novo')
      showToast(r.completo ? 'Receita importada — revise os campos antes de salvar.' : 'Importado, mas não achei "Modo de preparo" no documento — separe manualmente.', r.completo ? '✓' : '⚠️')
    } catch {
      showToast('Não consegui ler esse arquivo (.docx).', '⚠️')
    }
    setImportando(false)
  }

  async function carregar() {
    setCarregando(true)
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('receitas').select('id,titulo,categoria,autor,publicada,chef_id,chefs(nome)').order('titulo'),
      supabase.from('chefs').select('id,nome').eq('ativo', true).order('nome'),
    ])
    setReceitas(r || []); setChefs(c || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  const lista = useMemo(() => {
    const b = semAcento(busca.trim())
    if (!b) return receitas
    return receitas.filter((r) => semAcento(`${r.titulo} ${r.autor || ''} ${r.chefs?.nome || ''}`).includes(b))
  }, [receitas, busca])

  function abrirNovo() { setForm(VAZIO); setEditando('novo') }
  async function abrirEdicao(id) {
    const { data, error } = await supabase.from('receitas').select('*').eq('id', id).maybeSingle()
    if (error || !data) { showToast('Erro ao abrir.', '⚠️'); return }
    setForm({
      titulo: data.titulo || '', categoria: data.categoria || 'Pratos principais', chef_id: data.chef_id || '',
      autor: data.autor || '', descricao: data.descricao || '', ingredientes: data.ingredientes || '',
      modo_preparo: data.modo_preparo || '', tempo_preparo: data.tempo_preparo || '', rendimento: data.rendimento || '',
      foto_url: data.foto_url || '', publicada: !!data.publicada,
    })
    setEditando(data)
  }
  function campo(k) { return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) } }

  async function salvar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { showToast('Informe o título.', '⚠️'); return }
    setSalvando(true)
    const payload = { ...form, chef_id: form.chef_id || null }
    const resp = editando === 'novo'
      ? await supabase.from('receitas').insert(payload)
      : await supabase.from('receitas').update(payload).eq('id', editando.id)
    setSalvando(false)
    if (resp.error) { showToast('Erro: ' + resp.error.message, '⚠️'); return }
    showToast('Receita salva.', '✓'); setEditando(null); carregar()
  }

  if (editando) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo={editando === 'novo' ? 'Nova receita' : 'Editar receita'} voltar={() => setEditando(null)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={salvar} className="flex flex-col gap-3">
            <input className="ics-input" placeholder="Título da receita" {...campo('titulo')} />
            <div className="flex gap-3">
              <select className="ics-input flex-1" {...campo('categoria')}>{CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              <select className="ics-input flex-1" {...campo('chef_id')}>
                <option value="">Chef (da equipe)…</option>
                {chefs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <input className="ics-input" placeholder="Autor (se não for chef da equipe)" {...campo('autor')} />
            <div className="flex gap-3">
              <input className="ics-input flex-1" placeholder="Tempo de preparo" {...campo('tempo_preparo')} />
              <input className="ics-input flex-1" placeholder="Rendimento" {...campo('rendimento')} />
            </div>
            <input className="ics-input" placeholder="URL da foto (opcional)" {...campo('foto_url')} />
            <textarea className="ics-input min-h-16" placeholder="Descrição (opcional)" {...campo('descricao')} />
            <label className="text-sm text-ics-cinza font-medium">Ingredientes (um por linha)
              <textarea className="ics-input min-h-32 mt-1" {...campo('ingredientes')} />
            </label>
            <label className="text-sm text-ics-cinza font-medium">Modo de preparo
              <textarea className="ics-input min-h-32 mt-1" {...campo('modo_preparo')} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.publicada} onChange={(e) => setForm((p) => ({ ...p, publicada: e.target.checked }))} />
              Publicada (aparece no site público)
            </label>
            <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
              {salvando ? 'Salvando…' : 'Salvar receita'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Receitas" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button onClick={abrirNovo} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-2">+ Nova receita</button>
        <div className="flex gap-2 mb-3">
          <button onClick={baixarModelo} disabled={baixandoModelo} className="flex-1 border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3 disabled:opacity-50 text-sm">
            {baixandoModelo ? 'Gerando…' : '⬇ Modelo (Word)'}
          </button>
          <button onClick={() => inputImportarRef.current?.click()} disabled={importando} className="flex-1 border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3 disabled:opacity-50 text-sm">
            {importando ? 'Lendo…' : '⬆ Importar do Word'}
          </button>
          <input ref={inputImportarRef} type="file" accept=".docx" onChange={importarWord} className="hidden" />
        </div>
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar receita ou chef…" aria-label="Buscar receita ou chef" className="ics-input mb-4" />
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && <p className="text-xs text-ics-cinza mb-2">{lista.length} receitas</p>}
        <div className="flex flex-col gap-2">
          {lista.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{r.titulo}{!r.publicada ? ' · rascunho' : ''}</p>
                <p className="text-xs text-ics-cinza truncate">{[r.categoria, r.chefs?.nome || r.autor].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => abrirEdicao(r.id)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1 flex-shrink-0">Editar</button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
