// Único lugar donde el frontend habla con el backend.
// Agrega el token a cada pedido y convierte los errores { error: "..." } en excepciones.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CLAVE_TOKEN = 'nexovet_token'

export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token)
export const leerToken = () => localStorage.getItem(CLAVE_TOKEN)
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN)

export class ApiError extends Error {
  constructor(status, mensaje) {
    super(mensaje)
    this.status = status
  }
}

// El contexto de sesión se suscribe para cerrar la sesión cuando el token deja de servir.
let alVencerSesion = () => {}
export const registrarVencimiento = (fn) => { alVencerSesion = fn }

async function pedir(metodo, ruta, cuerpo) {
  const token = leerToken()
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/api${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.')
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    // 401 con token guardado = sesión vencida (en el login no hay token todavía)
    if (respuesta.status === 401 && token) alVencerSesion()
    throw new ApiError(respuesta.status, datos?.error || 'Ocurrió un error inesperado.')
  }
  return datos
}

export const api = {
  get: (ruta) => pedir('GET', ruta),
  post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
  put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
  patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo ?? {}),
  delete: (ruta) => pedir('DELETE', ruta),
}
