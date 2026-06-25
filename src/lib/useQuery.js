import { useEffect, useState } from 'react'
import { supabaseConfigurado } from './supabase.js'

// Hook simples para buscas no Supabase com estados de carregando/erro/vazio.
// fn: (signal) => Promise<{ data, error }>  (normalmente um query builder do supabase)
export function useQuery(fn, deps = []) {
  const [data, setData] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)

    if (!supabaseConfigurado) {
      setData(null)
      setErro('nao-configurado')
      setCarregando(false)
      return
    }

    Promise.resolve(fn())
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) setErro(error.message || 'erro')
        setData(data)
      })
      .catch((e) => { if (ativo) setErro(e.message || 'erro') })
      .finally(() => { if (ativo) setCarregando(false) })

    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, erro, carregando, configurado: supabaseConfigurado }
}
