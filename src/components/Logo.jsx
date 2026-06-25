// Logo oficial do Instituto (PNG) para o variant 'full'.
// Para o 'mark' (ícone pequeno na nav/cabeçalho) usamos o garfo estilizado,
// porque o texto do logo não fica legível em ~24px.
const LOGO_PNG = `${import.meta.env.BASE_URL}logo-ics.png`

function Garfo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M7 2v7a2 2 0 0 0 2 2v11M9 2v7M11 2v7" />
      <path d="M16 2c-1.6 0-2.5 1.8-2.5 5s.9 5 2.5 5v10" />
    </svg>
  )
}

export default function Logo({ variant = 'mark', className = '' }) {
  if (variant === 'mark') {
    return <Garfo className={`text-ics-preto ${className}`} />
  }

  return <img src={LOGO_PNG} alt="Instituto César Santos" className={`w-44 max-w-[70%] h-auto ${className}`} />
}
