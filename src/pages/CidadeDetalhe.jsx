import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { CHEFS, chefById } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { showToast } from '../utils/toast.js'

const TIPOS = ['Restaurante', 'Restaurante regional', 'Bar e petiscaria', 'Bistrô', 'Confeitaria', 'Lanchonete', 'Outro']

export default function CidadeDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cidadeById, restaurantesDaCidade, addRestaurante, atribuirChef } = useData()

  const cidade = cidadeById(id)
  const restaurantes = restaurantesDaCidade(id)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ nome: '', tipo: TIPOS[0], responsavel: '', contato: '' })

  if (!cidade) {
    return <Layout titulo="Cidade" voltar={true}><p className="text-sm text-ics-cinza">Cidade não encontrada.</p></Layout>
  }

  function campo(chave) {
    return { value: form[chave], onChange: (e) => setForm((p) => ({ ...p, [chave]: e.target.value })) }
  }

  function cadastrar(e) {
    e.preventDefault()
    if (!form.nome || !form.responsavel || !form.contato) {
      showToast('Preencha nome, responsável e contato.', '⚠️')
      return
    }
    addRestaurante({ ...form, cidadeId: id })
    setForm({ nome: '', tipo: TIPOS[0], responsavel: '', contato: '' })
    setMostrarForm(false)
    showToast('Restaurante cadastrado na cidade.', '✓')
  }

  return (
    <Layout titulo={cidade.nome} voltar={true}>
      <p className="text-sm text-ics-cinza mb-4">Restaurantes desta cidade. Distribua cada um para um chef.</p>

      <button onClick={() => setMostrarForm((v) => !v)} className="w-full bg-ics-preto text-white font-semibold rounded-2xl py-3 mb-4">
        {mostrarForm ? 'Cancelar' : '+ Cadastrar restaurante'}
      </button>

      {mostrarForm && (
        <Card className="mb-5">
          <form onSubmit={cadastrar} className="flex flex-col gap-3">
            <input className="ics-input" placeholder="Nome do restaurante" {...campo('nome')} />
            <select className="ics-input" {...campo('tipo')}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="ics-input" placeholder="Responsável no local" {...campo('responsavel')} />
            <input className="ics-input" placeholder="Contato (WhatsApp)" {...campo('contato')} />
            <button type="submit" className="bg-ics-preto text-white font-semibold rounded-xl py-3">Cadastrar</button>
          </form>
        </Card>
      )}

      <div className="flex flex-col gap-2.5">
        {restaurantes.length === 0 && <p className="text-sm text-ics-cinza">Nenhum restaurante nesta cidade ainda.</p>}
        {restaurantes.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between gap-3 mb-2" onClick={() => navigate(`/restaurantes/${r.id}`)}>
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.nome}</p>
                <p className="text-sm text-ics-cinza truncate">{r.tipo}</p>
              </div>
              <Badge status={r.status} />
            </div>
            <label className="flex items-center gap-2 text-sm border-t border-black/5 pt-2.5">
              <span className="text-ics-cinza">Chef:</span>
              <select
                className="flex-1 bg-transparent font-medium text-ics-preto"
                value={r.chefId || ''}
                onChange={(e) => { atribuirChef(r.id, e.target.value || null); showToast('Distribuição atualizada.', '✓') }}
              >
                <option value="">— não distribuído —</option>
                {CHEFS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
