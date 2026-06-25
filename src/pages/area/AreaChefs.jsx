import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { linkWhatsapp } from '../../utils/formatters.js'

export default function AreaChefs() {
  const [chefs, setChefs] = useState([])
  const [porChefRest, setPorChefRest] = useState({})
  const [porChefAg, setPorChefAg] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    ;(async () => {
      setCarregando(true)
      const [{ data: cfs }, { data: rs }, { data: ags }] = await Promise.all([
        supabase.from('chefs').select('*').eq('ativo', true).order('ordem'),
        supabase.from('restaurantes').select('chef_id'),
        supabase.from('agendamentos').select('chef_id,status'),
      ])
      const cr = {}, ca = {}
      ;(rs || []).forEach((r) => { if (r.chef_id) cr[r.chef_id] = (cr[r.chef_id] || 0) + 1 })
      ;(ags || []).forEach((a) => { if (a.chef_id) ca[a.chef_id] = (ca[a.chef_id] || 0) + 1 })
      setChefs((cfs || []).filter((c) => !['cesar-santos', 'luciano-roberto', 'joselia-maria'].includes(c.slug)))
      setPorChefRest(cr); setPorChefAg(ca)
      setCarregando(false)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Chefs consultores" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        <div className="flex flex-col gap-2.5">
          {chefs.map((c) => (
            <Card key={c.id} className="flex items-center gap-3">
              <Link to={`/area/chefs/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-full bg-ics-preto text-white flex items-center justify-center font-title font-semibold flex-shrink-0">
                  {c.iniciais || c.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{c.nome}</p>
                  <p className="text-sm text-ics-cinza truncate">{c.especialidade || ''}</p>
                </div>
              </Link>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="text-right text-xs text-ics-cinza">
                  <p><strong className="text-ics-preto">{porChefRest[c.id] || 0}</strong> restaurantes</p>
                  <p><strong className="text-ics-preto">{porChefAg[c.id] || 0}</strong> consultorias</p>
                </div>
                {linkWhatsapp(c.whatsapp) && (
                  <a href={linkWhatsapp(c.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${c.nome}`} className="inline-flex items-center gap-1 text-[#128C7E] text-xs font-semibold border border-[#25D366]/40 rounded-full px-2 py-1">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.087zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
