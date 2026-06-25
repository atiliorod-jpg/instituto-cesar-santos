import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) {
      setCarregando(false)
      return
    }
    let ativo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return
      setSessao(data.session)
      if (data.session) carregarPerfil(data.session.user.id)
      else setCarregando(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, novaSessao) => {
      setSessao(novaSessao)
      if (novaSessao) carregarPerfil(novaSessao.user.id)
      else { setPerfil(null); setCarregando(false) }
    })

    return () => { ativo = false; sub.subscription.unsubscribe() }
  }, [])

  async function carregarPerfil(userId) {
    setCarregando(true)
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).maybeSingle()
    setPerfil(data)
    setCarregando(false)
  }

  async function login(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return error
  }

  async function logout() {
    await supabase.auth.signOut()
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ sessao, perfil, carregando, login, logout, configurado: supabaseConfigurado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
