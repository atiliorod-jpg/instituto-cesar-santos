import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { showToast } from '../../utils/toast.js'

const VAZIO = {
  nome: '', cargo: '', especialidade: '', bio: '', foto_url: '', whatsapp: '',
  destaque: false, ativo: true, ordem: 0,
}

export default function AreaEquipeEditor() {
  const [chefs, setChefs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null) // null | 'novo' | chef
  const [form, setForm] = useState(VAZIO)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase.from('chefs').select('*').order('ordem')
    setChefs(data || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() { setForm(VAZIO); setEditando('novo') }
  function abrirEdicao(c) {
    setForm({
      nome: c.nome || '', cargo: c.cargo || '', especialidade: c.especialidade || '',
      bio: c.bio || '', foto_url: c.foto_url || '', whatsapp: c.whatsapp || '', destaque: !!c.destaque,
      ativo: c.ativo !== false, ordem: c.ordem ?? 0,
    })
    setEditando(c)
  }
  function campo(k) { return { value: form[k], onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) } }

  async function salvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) { showToast('Informe o nome.', '⚠️'); return }
    setSalvando(true)
    const payload = { ...form, ordem: Number(form.ordem) || 0 }
    const resp = editando === 'novo'
      ? await supabase.from('chefs').insert(payload)
      : await supabase.from('chefs').update(payload).eq('id', editando.id)
    setSalvando(false)
    if (resp.error) { showToast('Erro: ' + resp.error.message, '⚠️'); return }
    showToast('Perfil salvo.', '✓'); setEditando(null); carregar()
  }

  if (editando) {
    return (
      <div className="min-h-screen bg-ics-bege pb-16">
        <AreaHeader titulo={editando === 'novo' ? 'Novo membro' : 'Editar perfil'} voltar={() => setEditando(null)} />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={salvar} className="flex flex-col gap-3">
            <input className="ics-input" placeholder="Nome" aria-label="Nome" {...campo('nome')} />
            <input className="ics-input" placeholder="Cargo (ex: Chef Consultor)" aria-label="Cargo" {...campo('cargo')} />
            <input className="ics-input" placeholder="Especialidade" aria-label="Especialidade" {...campo('especialidade')} />
            <input className="ics-input" placeholder="URL da foto" aria-label="URL da foto" {...campo('foto_url')} />
            <input className="ics-input" placeholder="WhatsApp (ex: 81 99999-9999)" aria-label="WhatsApp" inputMode="tel" {...campo('whatsapp')} />
            <label className="text-sm text-ics-cinza font-medium">Bio
              <textarea className="ics-input min-h-32 mt-1" {...campo('bio')} />
            </label>
            <div className="flex gap-3">
              <label className="text-sm text-ics-cinza font-medium flex-1">Ordem
                <input type="number" className="ics-input mt-1" {...campo('ordem')} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.destaque} onChange={(e) => setForm((p) => ({ ...p, destaque: e.target.checked }))} />
              Destaque (aparece em primeiro, grande)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))} />
              Ativo (aparece no site público)
            </label>
            <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
              {salvando ? 'Salvando…' : 'Salvar perfil'}
            </button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Equipe & Bios" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button onClick={abrirNovo} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">+ Novo membro</button>
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && chefs.length === 0 && <p className="text-sm text-ics-cinza py-6 text-center">Nenhum membro cadastrado ainda.</p>}
        <div className="flex flex-col gap-2">
          {chefs.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{c.nome}{c.ativo === false ? ' · oculto' : ''}{c.destaque ? ' · destaque' : ''}</p>
                <p className="text-xs text-ics-cinza truncate">{[c.cargo, c.especialidade].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => abrirEdicao(c)} className="text-xs font-medium text-ics-preto border border-black/10 rounded-lg px-2.5 py-1 flex-shrink-0">Editar</button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
