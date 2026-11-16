import { api } from './api'

// Sube una imagen directo a Cloudinary con una firma que entrega nuestro backend
// (el secreto de Cloudinary nunca llega al navegador) y devuelve la URL pública.
export async function subirACloudinary(archivo) {
  const firma = await api.get('/imagenes/firma')

  const datos = new FormData()
  datos.append('file', archivo)
  datos.append('api_key', firma.api_key)
  datos.append('timestamp', firma.timestamp)
  datos.append('folder', firma.folder)
  datos.append('signature', firma.signature)

  let respuesta
  try {
    respuesta = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloud_name}/image/upload`, { method: 'POST', body: datos })
  } catch {
    throw new Error('No se pudo conectar con Cloudinary. Revisá tu conexión e intentá de nuevo.')
  }

  const resultado = await respuesta.json().catch(() => null)
  if (!respuesta.ok) throw new Error(resultado?.error?.message || 'No se pudo subir la imagen.')
  return resultado.secure_url
}

const MAXIMO_MB = 10

// Devuelve el motivo por el que una imagen no sirve, o '' si está bien
export function errorDeImagen(archivo) {
  if (!archivo.type.startsWith('image/')) return 'el archivo tiene que ser una imagen.'
  if (archivo.size > MAXIMO_MB * 1024 * 1024) return `pesa más de ${MAXIMO_MB} MB. Elegí una más liviana.`
  return ''
}
