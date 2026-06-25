import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Em desenvolvimento, avisa cedo se faltar configurar o .env.local
if (!url || !key) {
  console.warn(
    '[ICS] Supabase não configurado. Crie ics-app/.env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).'
  )
}

export const supabase = createClient(url || 'http://localhost', key || 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const supabaseConfigurado = Boolean(url && key)
