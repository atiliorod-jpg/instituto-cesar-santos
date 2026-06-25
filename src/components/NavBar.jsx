import { NavLink } from 'react-router-dom'
import { IconHome, IconList, IconCalendar, IconUsers, IconChart, IconPhoto, IconFolder, IconPlus } from './Icons.jsx'

const TABS_POR_PERFIL = {
  luciano: [
    { to: '/', label: 'Início', icon: IconHome, end: true },
    { to: '/cidades', label: 'Cidades', icon: IconList },
    { to: '/agenda', label: 'Agenda', icon: IconCalendar },
    { to: '/chefs', label: 'Chefs', icon: IconUsers },
    { to: '/relatorios', label: 'Relatórios', icon: IconChart },
  ],
  chef: [
    { to: '/', label: 'Agenda', icon: IconHome, end: true },
    { to: '/clientes', label: 'Clientes', icon: IconUsers },
    { to: '/materiais', label: 'Materiais', icon: IconFolder },
  ],
  captacao: [
    { to: '/', label: 'Prospects', icon: IconHome, end: true },
    { to: '/novo', label: 'Novo', icon: IconPlus },
  ],
  cliente: [
    { to: '/', label: 'Início', icon: IconHome, end: true },
    { to: '/fotos', label: 'Fotos', icon: IconPhoto },
    { to: '/materiais', label: 'Materiais', icon: IconFolder },
  ],
}

export default function NavBar({ role }) {
  const tabs = TABS_POR_PERFIL[role] || []
  if (tabs.length === 0) return null

  return (
    <nav aria-label="Navegação da área" className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 flex z-40">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium ${
              isActive ? 'text-ics-dourado' : 'text-ics-cinza'
            }`
          }
        >
          <Icon width={20} height={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
