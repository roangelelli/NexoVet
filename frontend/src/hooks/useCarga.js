import { useEffect, useState } from 'react'

// Carga datos del backend al abrir la pantalla (y cada vez que cambian las dependencias).
// Uso: const { datos, cargando, error, recargar } = useCarga(() => api.get('/clientes'), [])
export function useCarga(cargar, dependencias) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    setEstado((e) => ({ ...e, cargando: true, error: '' }))
    cargar()
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: '' }))
      .catch((err) => vigente && setEstado({ datos: null, cargando: false, error: err.message }))
    return () => { vigente = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  return { ...estado, recargar: () => setVersion((v) => v + 1) }
}
