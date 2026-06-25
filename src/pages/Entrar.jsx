import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'
import { IconBack } from '../components/Icons.jsx'
import { showToast } from '../utils/toast.js'

export default function Entrar() {
  const navigate = useNavigate()
  const { login, configurado } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function aoSubmeter(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const err = await login(email, senha)
    setEnviando(false)
    if (err) setErro('E-mail ou senha incorretos.')
    else navigate('/area')
  }

  async function esqueciSenha() {
    if (!email) { setErro('Digite seu e-mail acima primeiro.'); return }
    if (!configurado) { setErro('Login ainda não ativado (Supabase não conectado).'); return }
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}entrar`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) setErro('Não foi possível enviar o e-mail de redefinição.')
    else showToast('Enviamos um link de redefinição para seu e-mail.', '✉️')
  }

  return (
    <div className="min-h-screen bg-ics-bege flex flex-col px-6 py-6">
      <Link to="/" className="flex items-center gap-1 text-ics-cinza text-sm self-start mb-6">
        <IconBack width={18} height={18} /> Voltar ao início
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <div className="flex justify-center mb-6"><Logo variant="full" /></div>
        <h1 className="font-title text-xl font-semibold text-center mb-1">Área da equipe</h1>
        <p className="text-sm text-ics-cinza text-center mb-6">Acesso da equipe do Instituto e restaurantes parceiros.</p>

        <form onSubmit={aoSubmeter} className="flex flex-col gap-3">
          <input type="email" className="ics-input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" className="ics-input" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button type="submit" disabled={enviando || !configurado} className="bg-ics-preto text-white font-semibold rounded-2xl py-3.5 mt-1 disabled:opacity-50">
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
          <button type="button" onClick={esqueciSenha} className="text-sm text-ics-cinza font-medium">
            Esqueci minha senha
          </button>
        </form>

        {!configurado && (
          <p className="text-xs text-ics-cinza text-center mt-4">
            O login com conta é ativado quando o banco de dados for conectado.
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-xs text-ics-cinza">ou</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        <button
          onClick={() => navigate('/demo')}
          className="border border-ics-preto text-ics-preto font-semibold rounded-2xl py-3.5"
        >
          Explorar como demonstração
        </button>
        <p className="text-xs text-ics-cinza text-center mt-2">Entra sem conta, para conhecer a área da equipe.</p>
      </div>
    </div>
  )
}
