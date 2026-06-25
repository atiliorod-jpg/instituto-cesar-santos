import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import { showToast } from '../../utils/toast.js'
import { CAMPOS_SOBRE } from '../../data/sobreTexto.js'

export default function AreaConteudo() {
  const [form, setForm] = useState(() => Object.fromEntries(CAMPOS_SOBRE.map((c) => [c.chave, ''])))
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase.from('conteudo').select('chave,valor').like('chave', 'sobre.%')
    const salvos = Object.fromEntries((data || []).map((l) => [l.chave, l.valor]))
    // Mostra o valor salvo OU o texto padrão (para o diretor partir do conteúdo atual).
    setForm(Object.fromEntries(CAMPOS_SOBRE.map((c) => [c.chave, salvos[c.chave] ?? c.padrao])))
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    const linhas = CAMPOS_SOBRE.map((c) => ({ chave: c.chave, valor: form[c.chave] ?? '', atualizado_em: new Date().toISOString() }))
    const { error } = await supabase.from('conteudo').upsert(linhas)
    setSalvando(false)
    if (error) { showToast('Erro: ' + error.message, '⚠️'); return }
    showToast('Conteúdo publicado no site.', '✓')
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Conteúdo — Sobre" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <p className="text-sm text-ics-cinza mb-4">Edite os textos da página pública “Sobre o Instituto”. As mudanças aparecem no site assim que você salvar.</p>
        {carregando ? (
          <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>
        ) : (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            {CAMPOS_SOBRE.map((c) => (
              <label key={c.chave} className="text-sm text-ics-cinza font-medium">{c.label}
                <textarea
                  className="ics-input mt-1 min-h-24"
                  value={form[c.chave]}
                  onChange={(e) => setForm((f) => ({ ...f, [c.chave]: e.target.value }))}
                />
              </label>
            ))}
            <button type="submit" disabled={salvando} className="bg-ics-preto text-white font-semibold rounded-xl py-3 disabled:opacity-50">
              {salvando ? 'Salvando…' : 'Salvar e publicar'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
