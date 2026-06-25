import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/SessionContext.jsx'
import NavBar from './NavBar.jsx'
import ToastHost from './ToastHost.jsx'
import Logo from './Logo.jsx'
import { IconBack } from './Icons.jsx'

// voltar: true -> usa navigate(-1) | string -> navega para uma rota fixa | undefined -> sem botão de voltar
export default function Layout({ titulo, voltar, children }) {
  const { session, logout } = useSession()
  const navigate = useNavigate()

  function aoVoltar() {
    if (voltar === true) navigate(-1)
    else navigate(voltar)
  }

  return (
    <div className="min-h-screen bg-ics-bege pb-24">
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <ToastHost />
      <header className="sticky top-0 z-30 bg-ics-bege/95 backdrop-blur border-b border-black/5 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {voltar ? (
            <button onClick={aoVoltar} aria-label="Voltar" className="p-1.5 -ml-1.5 text-ics-preto">
              <IconBack />
            </button>
          ) : (
            <Logo variant="mark" className="w-6 h-6 flex-shrink-0" />
          )}
          <h1 className="font-title text-lg font-semibold text-ics-preto truncate">{titulo}</h1>
        </div>
        {session && (
          <div className="flex items-center gap-3 text-xs flex-shrink-0">
            <span className="badge badge-gold">Demonstração</span>
            <button onClick={() => { logout(); navigate('/') }} className="text-ics-cinza font-medium">Sair</button>
          </div>
        )}
      </header>

      <main id="conteudo" className="px-4 py-4">{children}</main>

      {session && <NavBar role={session.role} />}
    </div>
  )
}
