import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { useSession } from '../store/SessionContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { IconCamera, IconVideo, IconPhone, IconPlus } from '../components/Icons.jsx'
import { fmtDataLonga } from '../utils/formatters.js'
import { showToast } from '../utils/toast.js'

export default function ChefConsultoria() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const { agendamentoById, restauranteById, getFotosVisiveis, getNotaPrivada, getRelatorio, addFoto, setNotaPrivada, setRelatorio, finalizarConsultoria } = useData()

  const agendamento = agendamentoById(id)
  const restaurante = agendamento ? restauranteById(agendamento.restauranteId) : null
  const fotos = agendamento ? getFotosVisiveis(id, session) : []
  const fotosInternas = fotos.filter((f) => f.tipo === 'interna')
  const fotosCompartilhadas = fotos.filter((f) => f.tipo === 'compartilhada')

  const [nota, setNota] = useState(() => (agendamento ? getNotaPrivada(id, session) || '' : ''))
  const [relatorioTexto, setRelatorioTexto] = useState(() => (agendamento ? getRelatorio(id) || '' : ''))
  const [proximaData, setProximaData] = useState(agendamento?.dataProximoSugerida || '')

  const inputFotoInterna = useRef(null)
  const inputVideoInterno = useRef(null)
  const inputFotoCompartilhada = useRef(null)

  if (!agendamento || !restaurante) {
    return (
      <Layout titulo="Consultoria" voltar={true}>
        <p className="text-sm text-ics-cinza">Consultoria não encontrada.</p>
      </Layout>
    )
  }

  function aoSelecionarArquivo(e, tipo, rotuloPadrao) {
    const arquivo = e.target.files?.[0]
    addFoto(id, tipo, arquivo?.name || rotuloPadrao)
    showToast('Adicionado ao registro da visita.', '📎')
    e.target.value = ''
  }

  function salvarEFinalizar() {
    setNotaPrivada(id, nota)
    setRelatorio(id, relatorioTexto)
    finalizarConsultoria(id, { proximaData })
    showToast('Consultoria finalizada.', '✓')
    navigate('/')
  }

  const telefoneLimpo = restaurante.contato.replace(/\D/g, '')

  return (
    <Layout titulo={restaurante.nome} voltar={true}>
      <a
        href={`https://wa.me/55${telefoneLimpo.replace(/^55/, '')}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-ics-preto font-medium mb-5"
      >
        <IconPhone width={18} height={18} />
        {restaurante.contato}
      </a>

      <h2 className="font-title text-base font-semibold mb-1">Registro interno</h2>
      <p className="text-xs text-ics-cinza mb-3">Fotos e vídeos visíveis só para você e Luciano.</p>
      <div className="flex gap-2.5 mb-3">
        <BotaoUpload icon={IconCamera} label="Adicionar fotos" onClick={() => inputFotoInterna.current?.click()} />
        <BotaoUpload icon={IconVideo} label="Gravar vídeo" onClick={() => inputVideoInterno.current?.click()} />
      </div>
      <input ref={inputFotoInterna} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => aoSelecionarArquivo(e, 'interna', `Foto interna #${fotosInternas.length + 1}`)} />
      <input ref={inputVideoInterno} type="file" accept="video/*" capture="environment" className="hidden"
        onChange={(e) => aoSelecionarArquivo(e, 'interna', `Vídeo interno #${fotosInternas.length + 1}`)} />
      <GradeFotos fotos={fotosInternas} className="mb-6" />

      <h2 className="font-title text-base font-semibold mb-1">Compartilhar com o restaurante</h2>
      <p className="text-xs text-ics-cinza mb-3">Só estas fotos aparecem para o cliente.</p>
      <BotaoUpload icon={IconPlus} label="Adicionar foto" onClick={() => inputFotoCompartilhada.current?.click()} className="mb-3" />
      <input ref={inputFotoCompartilhada} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => aoSelecionarArquivo(e, 'compartilhada', `Foto compartilhada #${fotosCompartilhadas.length + 1}`)} />
      <GradeFotos fotos={fotosCompartilhadas} className="mb-6" />

      <Campo label="Anotações privadas (só você e Luciano veem)">
        <textarea
          className="ics-input min-h-24"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Pontos fortes, problemas observados, próximos passos…"
        />
      </Campo>

      <Campo label="Próxima data sugerida">
        <input type="date" className="ics-input" value={proximaData || ''} onChange={(e) => setProximaData(e.target.value)} />
        {proximaData && <p className="text-xs text-ics-cinza mt-1">{fmtDataLonga(proximaData)}</p>}
      </Campo>

      <Campo label="Relatório para o cliente (resumo simples, sem detalhes técnicos)">
        <textarea
          className="ics-input min-h-24"
          value={relatorioTexto}
          onChange={(e) => setRelatorioTexto(e.target.value)}
          placeholder="O que foi trabalhado na visita…"
        />
      </Campo>

      <button onClick={salvarEFinalizar} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mt-2">
        Salvar e finalizar consultoria
      </button>
    </Layout>
  )
}

function BotaoUpload({ icon: Icon, label, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 border border-black/10 rounded-xl py-3 text-sm font-medium bg-white ${className}`}>
      <Icon width={18} height={18} />
      {label}
    </button>
  )
}

function GradeFotos({ fotos, className = '' }) {
  if (fotos.length === 0) return <p className={`text-sm text-ics-cinza ${className}`}>Nada adicionado ainda.</p>
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {fotos.map((f) => (
        <div key={f.id} className="aspect-square rounded-lg bg-ics-preto/5 border border-black/5 p-2 flex items-end">
          <p className="text-[0.65rem] text-ics-cinza leading-tight">{f.label}</p>
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
