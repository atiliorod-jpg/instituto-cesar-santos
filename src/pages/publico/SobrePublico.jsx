import PublicLayout from '../../components/PublicLayout.jsx'
import Logo from '../../components/Logo.jsx'
import { supabase } from '../../lib/supabase.js'
import { useQuery } from '../../lib/useQuery.js'
import { SOBRE, SOBRE_TEXTO_DRAFT, montarSobre } from '../../data/sobreTexto.js'

function Secao({ titulo, children }) {
  return (
    <section className="mb-6">
      <h2 className="font-title text-lg font-semibold mb-1.5">{titulo}</h2>
      {children}
    </section>
  )
}

export default function SobrePublico() {
  const q = useQuery(() => supabase.from('conteudo').select('chave,valor').like('chave', 'sobre.%'))
  // Sem banco/linhas: usa o texto padrão. Com banco: mescla o que foi editado.
  const sobre = q.configurado && Array.isArray(q.data) ? montarSobre(q.data) : SOBRE

  return (
    <PublicLayout>
      <div className="flex justify-center mb-6"><Logo variant="full" /></div>

      <h1 className="font-title text-2xl font-semibold mb-3 text-center">Sobre o Instituto</h1>

      {SOBRE_TEXTO_DRAFT && (
        <p className="text-xs text-ics-cinza bg-white border border-black/5 rounded-xl px-3.5 py-2.5 mb-5">
          Rascunho — texto institucional aguardando revisão final.
        </p>
      )}

      <p className="text-sm leading-relaxed text-ics-preto/90 mb-7">{sobre.apresentacao}</p>

      <Secao titulo="Missão">
        <p className="text-sm leading-relaxed text-ics-preto/90 whitespace-pre-line">{sobre.missao}</p>
      </Secao>

      <div className="bg-white border border-black/5 rounded-2xl p-4 mt-2">
        <p className="text-xs text-ics-dourado font-semibold uppercase tracking-wide mb-1">Liderança</p>
        <p className="text-sm leading-relaxed text-ics-preto/90">{sobre.lideranca}</p>
      </div>
    </PublicLayout>
  )
}
