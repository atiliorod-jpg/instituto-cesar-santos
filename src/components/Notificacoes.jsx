import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { fmtData } from '../utils/formatters.js'

// Sino de notificações — avisa o usuário logado (ex.: chef) quando alguém
// mexeu em algo que é dele (ver gatilho notificar_chef_restaurante no banco).
export default function Notificacoes({ userId }) {
  const [lista, setLista] = useState([])
  const [aberto, setAberto] = useState(false)

  async function carregar() {
    if (!userId) return
    const { data } = await supabase.from('notificacoes').select('*').eq('destinatario_id', userId).order('criado_em', { ascending: false }).limit(20)
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [userId])

  const naoLidas = lista.filter((n) => !n.lida).length

  async function marcarLida(n) {
    if (n.lida) return
    await supabase.from('notificacoes').update({ lida: true }).eq('id', n.id)
    setLista((l) => l.map((x) => (x.id === n.id ? { ...x, lida: true } : x)))
  }

  if (!userId || lista.length === 0) return null

  return (
    <div className="relative">
      <button onClick={() => setAberto((v) => !v)} aria-label="Notificações" className="relative p-1.5 text-ics-preto">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        {naoLidas > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{naoLidas}</span>}
      </button>
      {aberto && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white border border-black/10 rounded-xl shadow-lg z-40">
          {lista.map((n) => (
            <button key={n.id} onClick={() => marcarLida(n)} className={`block w-full text-left px-3.5 py-3 border-b border-black/5 last:border-0 ${n.lida ? 'opacity-60' : ''}`}>
              <p className="text-sm font-semibold leading-tight">{n.titulo}</p>
              {n.mensagem && <p className="text-xs text-ics-cinza mt-0.5">{n.mensagem}</p>}
              <p className="text-[10px] text-ics-cinza mt-1">{fmtData(String(n.criado_em).slice(0, 10))}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
