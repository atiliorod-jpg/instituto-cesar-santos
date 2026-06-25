import { useState } from 'react'
import { useData } from '../store/DataContext.jsx'
import { CHEFS, chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { showToast } from '../utils/toast.js'
import { fmtData } from '../utils/formatters.js'

const VAZIO = {
  tipo: 'aula_show', titulo: '', cidade: '', data: '', hora: '', local: '',
  descricao: '', videoUrl: '', chefId: '', receitaId: '', publicada: true,
}

export default function LucianoAulas() {
  const { aulas, receitas, salvarAula, excluirAula } = useData()
  const [editando, setEditando] = useState(null) // null | 'novo' | aula
  const [form, setForm] = useState(VAZIO)

  function abrirNovo() { setForm(VAZIO); setEditando('novo') }
  function abrirEdicao(a) { setForm({ ...VAZIO, ...a, chefId: a.chefId || '', receitaId: a.receitaId || '' }); setEditando(a) }
  function campo(k) { return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) } }

  function salvar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) { showToast('Informe o título.', '⚠️'); return }
    const payload = { ...form, data: form.data || null, chefId: form.chefId || null, receitaId: form.receitaId || null }
    if (editando !== 'novo') payload.id = editando.id
    salvarAula(payload)
    showToast('Aula salva.', '✓'); setEditando(null)
  }

  function excluir(a) {
    if (!confirm('Excluir esta aula?')) return
    excluirAula(a.id)
    showToast('Excluída.', '✓')
  }

  if (editando) {
    return (
      <Layout titulo={editando === 'novo' ? 'Nova aula' : 'Editar aula'} voltar="/aulas">
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <label className="sr-only" htmlFor="aula-tipo">Tipo</label>
          <select id="aula-tipo" className="ics-input" {...campo('tipo')}>
            <option value="aula_show">Aula show</option>
            <option value="curso">Curso</option>
          </select>
          <input className="ics-input" placeholder="Título" aria-label="Título" {...campo('titulo')} />
          <div className="flex gap-3">
            <input className="ics-input flex-1" placeholder="Cidade" aria-label="Cidade" {...campo('cidade')} />
            <input type="date" className="ics-input flex-1" aria-label="Data" {...campo('data')} />
          </div>
          <div className="flex gap-3">
            <input className="ics-input flex-1" placeholder="Hora (ex: 18h)" aria-label="Hora" {...campo('hora')} />
            <input className="ics-input flex-1" placeholder="Local" aria-label="Local" {...campo('local')} />
          </div>
          <label className="sr-only" htmlFor="aula-chef">Chef responsável</label>
          <select id="aula-chef" className="ics-input" {...campo('chefId')}>
            <option value="">Chef responsável…</option>
            {CHEFS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label className="sr-only" htmlFor="aula-rec">Vincular receita</label>
          <select id="aula-rec" className="ics-input" {...campo('receitaId')}>
            <option value="">Vincular receita (opcional)…</option>
            {receitas.map((r) => <option key={r.id} value={r.id}>{r.titulo}</option>)}
          </select>
          <input className="ics-input" placeholder="Link do vídeo (YouTube/Vimeo)" aria-label="Link do vídeo" {...campo('videoUrl')} />
          <textarea className="ics-input min-h-24" placeholder="Descrição" aria-label="Descrição" {...campo('descricao')} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.publicada} onChange={(e) => setForm((p) => ({ ...p, publicada: e.target.checked }))} />
            Publicada (aparece no site público)
          </label>
          <button type="submit" className="bg-ics-preto text-white font-semibold rounded-xl py-3">Salvar aula</button>
        </form>
      </Layout>
    )
  }

  return (
    <Layout titulo="Aulas & Cursos">
      <button onClick={abrirNovo} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">+ Nova aula / curso</button>
      {aulas.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhuma aula cadastrada ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {aulas.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-ics-dourado font-semibold uppercase">{a.tipo === 'curso' ? 'Curso' : 'Aula show'}{!a.publicada ? ' · rascunho' : ''}</p>
                <p className="font-semibold truncate">{a.titulo}</p>
                <p className="text-sm text-ics-cinza truncate">{[chefById(a.chefId)?.nome, a.cidade, a.data && fmtData(a.data)].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => abrirEdicao(a)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1">Editar</button>
                <button onClick={() => excluir(a)} className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2.5 py-1">Excluir</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
