import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'
import Logo from './Logo.jsx'
import { IconBack } from './Icons.jsx'

// Cabeçalho das telas da área da equipe (logado).
export default function AreaHeader({ titulo, voltar }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-ics-bege/95 backdrop-blur border-b border-black/5 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {voltar ? (
          <button onClick={() => (typeof voltar === 'function' ? voltar() : voltar === true ? navigate(-1) : navigate(voltar))} aria-label="Voltar" className="p-1.5 -ml-1.5 text-ics-preto">
            <IconBack />
          </button>
        ) : (
          <Logo variant="mark" className="w-6 h-6 flex-shrink-0" />
        )}
        <h1 className="font-title text-lg font-semibold text-ics-preto truncate">{titulo}</h1>
      </div>
      <div className="flex items-center gap-3 text-xs flex-shrink-0">
        <Link to="/area" className="text-ics-cinza font-medium">Área</Link>
        <button onClick={logout} className="text-ics-cinza font-medium">Sair</button>
      </div>
    </header>
  )
}
