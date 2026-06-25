import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { IconBack } from './Icons.jsx'

const LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/receitas', label: 'Receitas' },
  { to: '/aulas', label: 'Aulas & Cursos' },
  { to: '/equipe', label: 'Nossa equipe' },
  { to: '/sobre', label: 'Sobre' },
]

// voltar: true -> navigate(-1) | string -> rota fixa | undefined -> sem botão (mostra a logo)
export default function PublicLayout({ children, voltar }) {
  const navigate = useNavigate()

  function aoVoltar() {
    if (voltar === true) navigate(-1)
    else navigate(voltar)
  }

  return (
    <div className="min-h-screen bg-ics-bege">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <header className="sticky top-0 z-30 bg-ics-bege/95 backdrop-blur border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {voltar ? (
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={aoVoltar} aria-label="Voltar" className="p-1.5 -ml-1.5 text-ics-preto flex-shrink-0">
                <IconBack />
              </button>
              <Link to="/" className="flex items-center gap-2 min-w-0">
                <Logo variant="mark" className="w-6 h-6 flex-shrink-0" />
                <span className="font-title font-semibold text-ics-preto leading-tight text-sm truncate">
                  Instituto César Santos
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="mark" className="w-6 h-6" />
              <span className="font-title font-semibold text-ics-preto leading-tight text-sm">
                Instituto<br />César Santos
              </span>
            </Link>
          )}
          <button
            onClick={() => navigate('/entrar')}
            className="text-sm font-medium text-white bg-ics-preto rounded-full px-4 py-2"
          >
            Entrar
          </button>
        </div>
        <nav aria-label="Navegação principal" className="max-w-3xl mx-auto px-2 flex gap-1 overflow-x-auto">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-shrink-0 px-3 py-2.5 text-sm font-medium border-b-2 ${
                  isActive ? 'border-ics-dourado text-ics-preto' : 'border-transparent text-ics-cinza'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="conteudo" className="max-w-3xl mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-black/5 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-ics-cinza">
          <p className="font-title text-ics-preto font-semibold mb-1">Instituto César Santos</p>
          <p>Gastronomia Brasileira · Olinda, PE</p>
        </div>
      </footer>
    </div>
  )
}
