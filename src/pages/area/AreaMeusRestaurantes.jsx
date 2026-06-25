import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../store/AuthContext.jsx'
import AreaHeader from '../../components/AreaHeader.jsx'
import Card from '../../components/Card.jsx'
import { IconPhone } from '../../components/Icons.jsx'
import { cpfPorPapel } from '../../utils/formatters.js'
import { labelStatusRestaurante } from '../../data/opcoes.js'

function linkWhatsApp(contato) {
  const tel = (contato || '').replace(/\D/g, '').replace(/^55/, '')
  return tel ? `https://wa.me/55${tel}` : null
}

export default function AreaMeusRestaurantes() {
  const { perfil } = useAuth()
  const papel = perfil?.papel
  const [restaurantes, setRestaurantes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    ;(async () => {
      setCarregando(true)
      // RLS já limita o chef aos restaurantes distribuídos a ele (chef_id = meu_chef_id()).
      const { data } = await supabase
        .from('restaurantes')
        .select('id,nome,tipo,status,responsavel,contato,cpf,cidades(nome)')
        .order('nome')
      setRestaurantes(data || [])
      setCarregando(false)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-ics-bege pb-16">
      <AreaHeader titulo="Meus restaurantes" voltar="/area" />
      <main className="max-w-2xl mx-auto px-4 py-4">
        {carregando && <p className="text-sm text-ics-cinza py-6 text-center">Carregando…</p>}
        {!carregando && restaurantes.length === 0 && (
          <p className="text-sm text-ics-cinza py-6 text-center">
            Nenhum restaurante distribuído a você ainda. O diretor distribui os restaurantes na área de Distribuição.
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          {restaurantes.map((r) => {
            const wa = linkWhatsApp(r.contato)
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.nome}</p>
                    <p className="text-sm text-ics-cinza">{[r.cidades?.nome, r.tipo].filter(Boolean).join(' · ')}</p>
                    {r.responsavel && <p className="text-sm text-ics-cinza">{r.responsavel}</p>}
                    {r.cpf && <p className="text-xs text-ics-cinza">CPF {cpfPorPapel(r.cpf, papel)}</p>}
                  </div>
                  <span className="text-xs font-medium text-ics-dourado flex-shrink-0">{labelStatusRestaurante(r.status)}</span>
                </div>
                <div className="flex gap-2 border-t border-black/5 pt-2.5 mt-2.5">
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium border border-black/10 rounded-xl py-2 bg-white">
                      <IconPhone width={16} height={16} /> WhatsApp
                    </a>
                  )}
                  <Link to={`/area/consultorias?restaurante=${r.id}`} className="flex-1 text-center text-sm font-semibold text-white bg-ics-preto rounded-xl py-2">
                    Agendar consultoria
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
