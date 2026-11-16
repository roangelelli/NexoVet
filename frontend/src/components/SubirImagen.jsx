import { useState } from 'react'
import { api } from '../services/api'
import { errorDeImagen, subirACloudinary } from '../services/cloudinary'
import { Aviso, Boton, Campo, SelectorImagenes } from './ui'

// Adjunta una imagen a una atención: se sube a Cloudinary y después se guarda su URL en la base.
export default function SubirImagen({ atencionId, onSubida }) {
  const [archivo, setArchivo] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [clave, setClave] = useState(0) // cambia para vaciar el selector de archivo

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    if (!archivo) return setError('Elegí una imagen para subir.')
    const problema = errorDeImagen(archivo)
    if (problema) return setError(`La imagen no se puede subir: ${problema}`)

    setSubiendo(true)
    try {
      const url = await subirACloudinary(archivo)
      await api.post('/imagenes', { atencion_id: Number(atencionId), url, descripcion })
      setArchivo(null)
      setDescripcion('')
      setClave((k) => k + 1)
      onSubida()
    } catch (err) {
      setError(err.message)
    }
    setSubiendo(false)
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
      <h3 className="font-semibold">Agregar una imagen</h3>
      <Aviso tipo="error">{error}</Aviso>
      <SelectorImagenes id="imagen" etiqueta="Imagen (radiografía, foto, estudio)" archivos={archivo ? [archivo] : []} onChange={(lista) => setArchivo(lista[0] || null)} claveInput={clave} />
      <Campo id="descripcion" etiqueta="Descripción (opcional)" maxLength={255} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <Boton type="submit" cargando={subiendo}>Subir imagen</Boton>
    </form>
  )
}
