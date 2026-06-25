import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import Logo from '../../components/Logo.jsx'
import EstadoVazio from '../../components/EstadoVazio.jsx'
import { labelStatusRestaurante } from '../../data/opcoes.js'
import { fmtDataLonga, linkWhatsapp } from '../../utils/formatters.js'

export default function RestaurantePublico() {
  const { token } = useParams()

  const restQ = useQuery(() => supabase.rpc('rpc_restaurante_publico', { p_token: token }), [token])
  const rest = restQ.data?.[0] || null

  const relQ = useQuery(() => supabase.rpc('rpc_relatorios_restaurante', { p_token: token }), [token])
  const relatorios = relQ.data || []

  const matQ = useQuery(() => supabase.rpc('rpc_materiais_restaurante', { p_token: token }), [token])
  const materiais = matQ.data || []

  return (
    <div className="min-h-screen bg-ics-bege">
      <header className="border-b border-black/5">
        <div className="max-w-2xl mx-auto px-4 py-5 flex justify-center">
          <Logo variant="full" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <EstadoVazio
          carregando={restQ.carregando}
          erro={restQ.erro}
          vazio={!restQ.carregando && !rest}
          mensagemVazio="Link não encontrado. Confira o endereço ou fale com o Instituto."
        />

        {rest && (
          <>
            <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-1">Área do restaurante parceiro</p>
            <h1 className="font-title text-2xl font-semibold mb-1">{rest.nome}</h1>
            <div className="flex items-center gap-2 mb-6">
              {rest.tipo && <span className="text-sm text-ics-cinza">{rest.tipo}</span>}
              <span className="badge badge-grey">{labelStatusRestaurante(rest.status)}</span>
            </div>

            {rest.chef_nome && (
              <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3 mb-6">
                {rest.chef_foto ? (
                  <img src={rest.chef_foto} alt={rest.chef_nome} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-ics-preto text-white flex items-center justify-center font-title flex-shrink-0">
                    {rest.chef_nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ics-cinza">Chef consultor responsável</p>
                  <p className="font-semibold truncate">{rest.chef_nome}</p>
                </div>
                {linkWhatsapp(rest.chef_whatsapp) && (
                  <a href={linkWhatsapp(rest.chef_whatsapp)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#128C7E] border border-[#25D366]/40 rounded-full px-3 py-1.5 flex-shrink-0">
                    WhatsApp
                  </a>
                )}
              </div>
            )}

            {relatorios.length > 0 && (
              <section className="mb-6">
                <h2 className="font-title text-lg font-semibold mb-2.5">Relatório da consultoria</h2>
                <div className="flex flex-col gap-2.5">
                  {relatorios.map((r, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-black/5 p-4">
                      <p className="text-xs text-ics-cinza mb-2">
                        {fmtDataLonga(String(r.atualizado_em).slice(0, 10))}
                        {r.data_proximo && ` · próxima visita: ${fmtDataLonga(r.data_proximo)}`}
                      </p>
                      <p className="text-sm leading-relaxed text-ics-preto/90 whitespace-pre-line">{r.texto}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {materiais.length > 0 && (
              <section className="mb-6">
                <h2 className="font-title text-lg font-semibold mb-2.5">Materiais</h2>
                <div className="flex flex-col gap-2">
                  {materiais.map((m) => (
                    <a key={m.id} href={m.arquivo_url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border border-black/5 p-3.5 flex items-center justify-between">
                      <span className="font-medium text-sm">{m.nome}</span>
                      <span className="text-xs text-ics-cinza">{m.categoria}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {relatorios.length === 0 && materiais.length === 0 && !restQ.carregando && (
              <p className="text-sm text-ics-cinza text-center py-6">Ainda não há relatórios ou materiais compartilhados — em breve seu chef consultor traz novidades por aqui.</p>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-black/5 mt-4">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center text-sm text-ics-cinza">
          <p className="font-title text-ics-preto font-semibold mb-1">Instituto César Santos</p>
          <p>Gastronomia Brasileira · Olinda, PE</p>
        </div>
      </footer>
    </div>
  )
}
