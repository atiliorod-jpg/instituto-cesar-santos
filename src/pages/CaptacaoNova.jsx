import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import { showToast } from '../utils/toast.js'
import { buscarCep, fmtCep, montarEndereco } from '../utils/cep.js'

const TIPOS = ['Restaurante', 'Restaurante regional', 'Bar e petiscaria', 'Bistrô', 'Confeitaria', 'Lanchonete', 'Outro']

export default function CaptacaoNova() {
  const navigate = useNavigate()
  const { cidades, addRestaurante } = useData()

  const [form, setForm] = useState({ nome: '', cidadeId: '', tipo: TIPOS[0], responsavel: '', contato: '', cep: '', endereco: '', observacoes: '' })
  const [numero, setNumero] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)

  function campo(chave) {
    return {
      value: form[chave],
      onChange: (e) => setForm((prev) => ({ ...prev, [chave]: e.target.value })),
    }
  }

  async function aoSairDoCep() {
    if (!form.cep || buscandoCep) return
    setBuscandoCep(true)
    const r = await buscarCep(form.cep)
    setBuscandoCep(false)
    if (r.erro) { showToast(r.erro, '⚠️'); return }
    setForm((p) => ({ ...p, endereco: montarEndereco(r, numero) }))
    showToast('Endereço preenchido pelo CEP.', '✓')
  }

  function aoSubmeter(e) {
    e.preventDefault()
    if (!form.nome || !form.cidadeId || !form.responsavel || !form.contato) {
      showToast('Preencha nome, cidade, responsável e contato.', '⚠️')
      return
    }
    addRestaurante(form)
    showToast('Prospect registrado com sucesso.', '✓')
    navigate('/')
  }

  return (
    <Layout titulo="Novo prospect" voltar={true}>
      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <Campo label="Nome do restaurante">
          <input className="ics-input" {...campo('nome')} required />
        </Campo>
        <Campo label="Cidade de atendimento">
          <select className="ics-input" {...campo('cidadeId')} required>
            <option value="">Selecione…</option>
            {cidades.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Tipo de estabelecimento">
          <select className="ics-input" {...campo('tipo')}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo label="Responsável no local">
          <input className="ics-input" {...campo('responsavel')} required />
        </Campo>
        <Campo label="Contato (telefone/WhatsApp)">
          <input className="ics-input" placeholder="+55 81 9XXXX-XXXX" {...campo('contato')} required />
        </Campo>
        <div className="flex gap-3">
          <Campo label="CEP">
            <input
              className="ics-input"
              placeholder="00000-000"
              inputMode="numeric"
              value={form.cep}
              onChange={(e) => setForm((p) => ({ ...p, cep: fmtCep(e.target.value) }))}
              onBlur={aoSairDoCep}
            />
          </Campo>
          <Campo label="Número">
            <input className="ics-input w-20" value={numero} onChange={(e) => setNumero(e.target.value)} />
          </Campo>
        </div>
        {buscandoCep && <p className="text-xs text-ics-cinza -mt-2">Buscando endereço…</p>}
        <Campo label="Endereço">
          <input className="ics-input" placeholder="Preenchido pelo CEP — pode editar" {...campo('endereco')} />
        </Campo>
        <Campo label="Observações">
          <textarea className="ics-input min-h-24" {...campo('observacoes')} placeholder="Como foi o contato, interesse, contexto…" />
        </Campo>

        <button type="submit" className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mt-2">
          Registrar prospect
        </button>
      </form>
    </Layout>
  )
}

function Campo({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ics-cinza font-medium">{label}</span>
      {children}
    </label>
  )
}
