import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { fmtData } from '../utils/formatters.js'

// Alerta de prazo das cidades (diretor): mostra as que estão com data_limite
// vencendo (até 15 dias) ou vencida, e que não estão Concluída/Arquivada.
// Calculado ao vivo (site estático, sem cron) — atualiza a cada abertura da Área.

const JANELA_DIAS = 15
const INATIVAS = ['Concluída', 'Arquivada']

function diasAte(dataIso) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataIso + 'T00:00:00')
  return Math.round((alvo - hoje) / 86400000)
}

export default function AlertasPrazo() {
  const [itens, setItens] = useState([])

  useEffect(() => {
    let ativo = true
    ;(async () => {
      const { data } = await supabase
        .from('cidades')
        .select('id,nome,data_limite,status')
        .not('data_limite', 'is', null)
      if (!ativo || !data) return
      const lista = data
        .filter((c) => !INATIVAS.includes(c.status))
        .map((c) => ({ ...c, dias: diasAte(c.data_limite) }))
        .filter((c) => c.dias <= JANELA_DIAS)
        .sort((a, b) => a.dias - b.dias)
      setItens(lista)
    })()
    return () => { ativo = false }
  }, [])

  if (itens.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6" role="alert">
      <p className="font-semibold text-amber-900 text-sm mb-2">⏰ Prazos de cidade a vencer</p>
      <ul className="flex flex-col gap-1.5">
        {itens.map((c) => (
          <li key={c.id} className="text-sm flex items-center justify-between gap-2">
            <Link to={`/area/cidades/${c.id}`} className="font-medium text-amber-900 underline-offset-2 hover:underline truncate">
              {c.nome}
            </Link>
            <span className={`text-xs font-semibold whitespace-nowrap ${c.dias < 0 ? 'text-red-700' : 'text-amber-800'}`}>
              {c.dias < 0
                ? `vencida há ${Math.abs(c.dias)} dia${Math.abs(c.dias) === 1 ? '' : 's'}`
                : c.dias === 0
                  ? 'vence hoje'
                  : `vence em ${c.dias} dia${c.dias === 1 ? '' : 's'}`} · {fmtData(c.data_limite)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
