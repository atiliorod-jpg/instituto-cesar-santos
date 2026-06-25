import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'ics-session'

const SessionContext = createContext(null)

function carregarSessao() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// SESSION = { role: 'luciano' | 'chef' | 'captacao' | 'cliente', chefId?, restauranteId? }
// Isto é só um seletor de perfil para o protótipo — não é autenticação real.
export function SessionProvider({ children }) {
  const [session, setSession] = useState(carregarSessao)

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  function login(role, extra = {}) {
    setSession({ role, ...extra })
  }

  function logout() {
    setSession(null)
  }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession precisa estar dentro de SessionProvider')
  return ctx
}
