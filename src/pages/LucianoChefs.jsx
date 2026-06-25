import { useNavigate } from 'react-router-dom'
import { useData } from '../store/DataContext.jsx'
import { CHEFS } from '../data/chefs.js'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'

export default function LucianoChefs() {
  const navigate = useNavigate()
  const { agendamentosDoChef } = useData()

  return (
    <Layout titulo="Chefs consultores">
      <div className="flex flex-col gap-2.5">
        {CHEFS.map((chef) => {
          const ags = agendamentosDoChef(chef.id)
          const realizadas = ags.filter((a) => a.status === 'realizado').length
          return (
            <Card key={chef.id} onClick={() => navigate(`/chefs/${chef.id}`)} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-ics-preto text-white flex items-center justify-center font-title font-semibold flex-shrink-0">
                {chef.iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{chef.nome}</p>
                <p className="text-sm text-ics-cinza">{realizadas} consultoria{realizadas === 1 ? '' : 's'} realizada{realizadas === 1 ? '' : 's'}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </Layout>
  )
}
