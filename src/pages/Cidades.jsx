import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import { showToast } from '../utils/toast.js'

export default function Cidades() {
  const navigate = useNavigate()
  const { cidades, restaurantesDaCidade, addCidade } = useData()
  const [nova, setNova] = useState('')

  function criar(e) {
    e.preventDefault()
    if (!nova.trim()) return
    addCidade(nova.trim())
    setNova('')
    showToast('Cidade de atendimento criada.', '✓')
  }

  return (
    <Layout titulo="Cidades de atendimento">
      <form onSubmit={criar} className="flex gap-2 mb-5">
        <input className="ics-input flex-1" placeholder="Nova cidade (ex: Garanhuns)" value={nova} onChange={(e) => setNova(e.target.value)} />
        <button type="submit" className="bg-ics-preto text-white font-semibold rounded-xl px-4">Criar</button>
      </form>

      <div className="flex flex-col gap-2.5">
        {cidades.map((c) => {
          const rs = restaurantesDaCidade(c.id)
          const semChef = rs.filter((r) => !r.chefId).length
          return (
            <Card key={c.id} onClick={() => navigate(`/cidades/${c.id}`)}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.nome} <span className="text-ics-cinza font-normal">· {c.estado}</span></p>
                  <p className="text-sm text-ics-cinza">{rs.length} restaurante{rs.length === 1 ? '' : 's'}{semChef > 0 ? ` · ${semChef} sem chef` : ''}</p>
                </div>
                <span className="text-ics-cinza">›</span>
              </div>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}
