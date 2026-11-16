import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Icono from '../components/Icono'

// Avisos que aparecen un momento abajo a la derecha y se van solos (confirmaciones de "guardado", "turno reservado", etc.).
// Uso: const { avisar } = useToast(); avisar('Cambios guardados.')   // o avisar('No se pudo…', 'error')
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const contador = useRef(0)

  const cerrar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), [])

  const avisar = useCallback((texto, tipo = 'ok') => {
    contador.current += 1
    const id = contador.current
    setAvisos((lista) => [...lista, { id, texto, tipo }])
    setTimeout(() => cerrar(id), tipo === 'error' ? 8000 : 5000)
  }, [cerrar])

  return (
    <ToastContext.Provider value={{ avisar }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
        {avisos.map((a) => (
          <div
            key={a.id}
            role={a.tipo === 'error' ? 'alert' : 'status'}
            className="entrada pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-tinta p-4 text-white shadow-xl sm:w-96"
          >
            <span className={`grid size-7 shrink-0 place-items-center rounded-full ${a.tipo === 'error' ? 'bg-error' : 'bg-ok'}`}>
              <Icono nombre={a.tipo === 'error' ? 'alerta' : 'ok'} className="size-4" />
            </span>
            <p className="min-w-0 flex-1 pt-0.5">{a.texto}</p>
            <button type="button" onClick={() => cerrar(a.id)} aria-label="Cerrar aviso" className="grid size-7 shrink-0 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white">
              <Icono nombre="cerrar" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
