export default function Card({ children, onClick, className = '', ariaLabel }) {
  const interativo = typeof onClick === 'function'
  if (!interativo) {
    return (
      <div className={`bg-white rounded-2xl border border-black/5 p-4 ${className}`}>
        {children}
      </div>
    )
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      }}
      className={`bg-white rounded-2xl border border-black/5 p-4 cursor-pointer transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ics-dourado focus-visible:ring-offset-2 focus-visible:ring-offset-ics-bege ${className}`}
    >
      {children}
    </div>
  )
}
