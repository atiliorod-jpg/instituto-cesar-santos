import { useMemo, useState } from 'react'
import { useData } from '../store/DataContext.jsx'
import { CHEFS, chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { showToast } from '../utils/toast.js'
import { baixarFichaTecnicaModelo } from '../utils/fichaTecnicaWord.js'

const CATEGORIAS = ['Entradas', 'Pratos principais', 'Acompanhamentos', 'Sobremesas', 'Bebidas']
const VAZIO = {
  titulo: '', categoria: 'Pratos principais', chefId: '', autor: '', descricao: '',
  ingredientes: '', modoPreparo: '', tempoPreparo: '', rendimento: '', publicada: true,
}
function semAcento(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() }

export default function LucianoReceitas() {
  const { receitas, salvarReceita, excluirReceita } = useData()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null) // null | 'novo' | receita
  const [form, setForm] = useState(VAZIO)
  const [baixandoModelo, setBaixandoModelo] = useState(false)

  async function baixarModelo() {
    setBaixandoModelo(true)
    try { await baixarFichaTecnicaModelo() } catch { showToast('Erro ao gerar o modelo.', '⚠️') }
    setBaixandoModelo(false)
  }

  const lista = useMemo(() => {
    const b = semAcento(busca.trim())
    if (!b) return receitas
    return receitas.filter((r) => semAcento(`${r.titulo} ${r.autor || ''} ${chefById(r.chefId)?.nome || ''}`).includes(b))
  }, [receitas, busca])

  function abrirNovo() { setForm(VAZIO); setEditando('novo') }
  function abrirEdicao(r) {
    setForm({ ...VAZIO, ...r, chefId: r.chefId || '' })
    setEditando(r)
  }
  function campo(k) { return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) } }

  function salvar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { showToast('Informe o título.', '⚠️'); return }
    const payload = { ...form, chefId: form.chefId || null }
    if (editando !== 'novo') payload.id = editando.id
    salvarReceita(payload)
    showToast('Receita salva.', '✓'); setEditando(null)
  }

  function excluir(r) {
    if (!confirm('Excluir esta receita?')) return
    excluirReceita(r.id)
    showToast('Excluída.', '✓')
  }

  if (editando) {
    return (
      <Layout titulo={editando === 'novo' ? 'Nova receita' : 'Editar receita'} voltar="/receitas">
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <input className="ics-input" placeholder="Título da receita" aria-label="Título da receita" {...campo('titulo')} />
          <div className="flex gap-3">
            <label className="sr-only" htmlFor="rec-cat">Categoria</label>
            <select id="rec-cat" className="ics-input flex-1" {...campo('categoria')}>{CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <label className="sr-only" htmlFor="rec-chef">Chef</label>
            <select id="rec-chef" className="ics-input flex-1" {...campo('chefId')}>
              <option value="">Chef (da equipe)…</option>
              {CHEFS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <input className="ics-input" placeholder="Autor (se não for chef da equipe)" aria-label="Autor" {...campo('autor')} />
          <div className="flex gap-3">
            <input className="ics-input flex-1" placeholder="Tempo de preparo" aria-label="Tempo de preparo" {...campo('tempoPreparo')} />
            <input className="ics-input flex-1" placeholder="Rendimento" aria-label="Rendimento" {...campo('rendimento')} />
          </div>
          <textarea className="ics-input min-h-16" placeholder="Descrição (opcional)" aria-label="Descrição" {...campo('descricao')} />
          <label className="text-sm text-ics-cinza font-medium">Ingredientes (um por linha)
            <textarea className="ics-input min-h-32 mt-1" {...campo('ingredientes')} />
          </label>
          <label className="text-sm text-ics-cinza font-medium">Modo de preparo
            <textarea className="ics-input min-h-32 mt-1" {...campo('modoPreparo')} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.publicada} onChange={(e) => setForm((p) => ({ ...p, publicada: e.target.checked }))} />
            Publicada (aparece no site público)
          </label>
          <button type="submit" className="bg-ics-preto text-white font-semibold rounded-xl py-3">Salvar receita</button>
        </form>
      </Layout>
    )
  }

  return (
    <Layout titulo="Receitas">
      <button onClick={abrirNovo} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-2">+ Nova receita</button>
      <button onClick={baixarModelo} disabled={baixandoModelo} className="w-full border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3 mb-3 disabled:opacity-50">
        {baixandoModelo ? 'Gerando…' : '⬇ Baixar modelo de ficha técnica (Word)'}
      </button>
      <label className="sr-only" htmlFor="busca-rec">Buscar receita ou chef</label>
      <input id="busca-rec" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar receita ou chef…" className="ics-input mb-4" />
      <p className="text-xs text-ics-cinza mb-2">{lista.length} receita{lista.length === 1 ? '' : 's'}</p>
      <div className="flex flex-col gap-2">
        {lista.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{r.titulo}{!r.publicada ? ' · rascunho' : ''}</p>
              <p className="text-xs text-ics-cinza truncate">{[r.categoria, chefById(r.chefId)?.nome || r.autor].filter(Boolean).join(' · ')}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => abrirEdicao(r)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Editar</button>
              <button onClick={() => excluir(r)} className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2.5 py-1">Excluir</button>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
