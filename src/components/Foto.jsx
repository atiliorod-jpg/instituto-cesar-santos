import Logo from './Logo.jsx'

// Imagem com placeholder elegante quando não há foto_url.
export default function Foto({ src, alt, className = '', aspect = 'aspect-[4/3]' }) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`${aspect} w-full object-cover ${className}`} />
  }
  return (
    <div className={`${aspect} w-full bg-ics-preto/5 flex items-center justify-center ${className}`}>
      <Logo variant="mark" className="w-8 h-8 text-ics-cinza/40" />
    </div>
  )
}
