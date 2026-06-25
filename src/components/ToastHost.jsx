import { useEffect, useState } from 'react'
import { ouvirToast } from '../utils/toast.js'

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return ouvirToast((toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 2600)
    })
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="bg-ics-preto text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 text-sm">
          <span>{t.icone}</span>
          <span>{t.mensagem}</span>
        </div>
      ))}
    </div>
  )
}
