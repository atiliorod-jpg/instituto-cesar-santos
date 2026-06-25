import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import { IconPhone, IconCamera, IconPlus } from '../../components/Icons.jsx'
import { fmtDataLonga } from '../../utils/formatters.js'
import { showToast } from '../../utils/toast.js'

const BUCKET = 'consultorias'

function linkWhatsApp(contato) {
  const tel = (contato || '').replace(/\D/g, '').replace(/^55/, '')
  return tel ? `https://wa.me/55${tel}` : null
}

export default function AreaConsultoriaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ag, setAg] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [fotos, setFotos] = useState([]) // {id, tipo, storage_path, label, url}
  const [nota, setNota] = useState('')
  const [relatorio, setRelatorio] = useState('')
  const [proximaData, setProximaData] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const inputInterna = useRef(null)
  const inputCompartilhada = useRef(null)

  async function carregar() {
    setCarregando(true)
    const { data: a } = await supabase
      .from('agendamentos')
      .select('id,status,dias,data_proximo,restaurantes(nome,contato)')
      .eq('id', id).maybeSingle()
    setAg(a)
    setProximaData(a?.data_proximo || '')

    const [{ data: notaRow }, { data: relRow }, { data: fotoRows }] = await Promise.all([
      supabase.from('consultoria_notas').select('texto').eq('agendamento_id', id).maybeSingle(),
      supabase.from('consultoria_relatorios').select('texto').eq('agendamento_id', id).maybeSingle(),
      supabase.from('consultoria_fotos').select('id,tipo,storage_path,label').eq('agendamento_id', id).order('criado_em'),
    ])
    setNota(notaRow?.texto || '')
    setRelatorio(relRow?.texto || '')

    // Gera URLs assinadas (bucket privado)
    const comUrl = await Promise.all((fotoRows || []).map(async (f) => {
      let url = null
      if (f.storage_path) {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(f.storage_path, 3600)
        url = data?.signedUrl || null
      }
      return { ...f, url }
    }))
    setFotos(comUrl)
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [id])

  async function enviarFoto(e, tipo) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setEnviando(true)
    const caminho = `${id}/${Date.now()}_${arquivo.name.replace(/[^\w.\-]/g, '_')}`
    const up = await supabase.storage.from(BUCKET).upload(caminho, arquivo, { upsert: false })
    if (up.error) { setEnviando(false); showToast('Erro no envio: ' + up.error.message, '⚠️'); return }
    const { error } = await supabase.from('consultoria_fotos').insert({
      agendamento_id: id, tipo, storage_path: caminho, label: arquivo.name,
    })
    setEnviando(false)
    if (error) { showToast('Erro ao registrar: ' + error.message, '⚠️'); return }
    showToast('Foto adicionada.', '📎')
    carregar()
  }

  async function excluirFoto(f) {
    if (!confirm('Remover esta foto?')) return
    if (f.storage_path) await supabase.storage.from(BUCKET).remove([f.storage_path])
    await supabase.from('consultoria_fotos').delete().eq('id', f.id)
    showToast('Removida.', '✓'); carregar()
  }

  async function salvar({ finalizar } = {}) {
    setSalvando(true)
    const ops = [
      supabase.from('consultoria_notas').upsert({ agendamento_id: id, texto: nota, atualizado_em: new Date().toISOString() }),
      supabase.from('consultoria_relatorios').upsert({ agendamento_id: id, texto: relatorio, atualizado_em: new Date().toISOString() }),
      supabase.from('agendamentos').update({
        data_proximo: proximaData || null,
        ...(finalizar ? { status: 'realizado' } : {}),
      }).eq('id', id),
    ]
    const resultados = await Promise.all(ops)
    setSalvando(false)
    const erro = resultados.find((r) => r.error)?.error
    if (erro) { showToast('Erro: ' + erro.message, '⚠️'); return }
    showToast(finalizar ? 'Consultoria finalizada.' : 'Registro salvo.', '✓')
    if (finalizar) navigate('/area/consultorias')
    else carregar()
  }

  if (carregando) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Consultoria" voltar="/area/consultorias" /><p className="text-sm text-ics-cinza py-10 text-center">Carregando…</p></div>)
  if (!ag) return (<div className="min-h-screen bg-ics-bege"><AreaHeader titulo="Consultoria" voltar="/area/consultorias" /><p className="text-sm text-ics-cinza py-10 text-center">Consultoria não encontrada.</p></div>)

  const wa = linkWhatsApp(ag.restaurantes?.contato)
  const internas = fotos.filter((f) => f.tipo === 'interna')
  const compartilhadas = fotos.filter((f) => f.tipo === 'compartilhada')

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo={ag.restaurantes?.nome || 'Consultoria'} voltar="/area/consultorias" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ics-preto font-medium">
              <IconPhone width={18} height={18} /> {ag.restaurantes?.contato}
            </a>
          ) : <span />}
          <Badge status={ag.status} />
        </div>

        <h2 className="font-title text-base font-semibold mb-1">Registro interno</h2>
        <p className="text-xs text-ics-cinza mb-3">Fotos visíveis só para você e o diretor.</p>
        <BotaoUpload icon={IconCamera} label="Adicionar foto interna" onClick={() => inputInterna.current?.click()} disabled={enviando} className="mb-3" />
        <input ref={inputInterna} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => enviarFoto(e, 'interna')} />
        <GradeFotos fotos={internas} onExcluir={excluirFoto} className="mb-6" />

        <h2 className="font-title text-base font-semibold mb-1">Compartilhar com o restaurante</h2>
        <p className="text-xs text-ics-cinza mb-3">Só estas fotos aparecem para o cliente.</p>
        <BotaoUpload icon={IconPlus} label="Adicionar foto compartilhada" onClick={() => inputCompartilhada.current?.click()} disabled={enviando} className="mb-3" />
        <input ref={inputCompartilhada} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => enviarFoto(e, 'compartilhada')} />
        <GradeFotos fotos={compartilhadas} onExcluir={excluirFoto} className="mb-6" />

        <Campo label="Anotações privadas (só você e o diretor veem)">
          <textarea className="ics-input min-h-24" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Pontos fortes, problemas observados, próximos passos…" />
        </Campo>

        <Campo label="Próxima data sugerida">
          <input type="date" className="ics-input" value={proximaData || ''} onChange={(e) => setProximaData(e.target.value)} />
          {proximaData && <p className="text-xs text-ics-cinza mt-1">{fmtDataLonga(proximaData)}</p>}
        </Campo>

        <Campo label="Relatório para o cliente (resumo simples)">
          <textarea className="ics-input min-h-24" value={relatorio} onChange={(e) => setRelatorio(e.target.value)} placeholder="O que foi trabalhado na visita…" />
        </Campo>

        <div className="flex gap-2 mt-2">
          <button onClick={() => salvar()} disabled={salvando} className="flex-1 border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3 disabled:opacity-50">
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          {ag.status !== 'realizado' && (
            <button onClick={() => salvar({ finalizar: true })} disabled={salvando} className="flex-1 bg-ics-preto text-white font-semibold rounded-2xl py-3 disabled:opacity-50">
              Salvar e concluir
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

function BotaoUpload({ icon: Icon, label, onClick, disabled, className = '' }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`w-full flex items-center justify-center gap-2 border border-black/10 rounded-xl py-3 text-sm font-medium bg-white disabled:opacity-50 ${className}`}>
      <Icon width={18} height={18} /> {label}
    </button>
  )
}

function GradeFotos({ fotos, onExcluir, className = '' }) {
  if (fotos.length === 0) return <p className={`text-sm text-ics-cinza ${className}`}>Nada adicionado ainda.</p>
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {fotos.map((f) => (
        <div key={f.id} className="relative aspect-square rounded-lg bg-ics-preto/5 border border-black/5 overflow-hidden">
          {f.url ? <img src={f.url} alt={f.label || 'Foto da consultoria'} className="w-full h-full object-cover" />
                 : <div className="w-full h-full flex items-center justify-center p-1 text-[0.6rem] text-ics-cinza text-center">{f.label}</div>}
          <button onClick={() => onExcluir(f)} aria-label="Remover foto" className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full w-5 h-5 text-xs leading-none font-bold">×</button>
        </div>
      ))}
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm mb-5">
      <span className="text-ics-cinza font-medium">{label}</span>
      {children}
    </label>
  )
}
