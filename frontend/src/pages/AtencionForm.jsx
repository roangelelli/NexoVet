import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { errorDeImagen, subirACloudinary } from '../services/cloudinary'
import { useCarga } from '../hooks/useCarga'
import { Aviso, AreaTexto, Boton, Campo, Cargando, DosColumnas, EnlaceBoton, PanelAyuda, SelectorImagenes, Titulo } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { fechaLegible, hoy } from '../utils'

const VACIA = { fecha: hoy(), motivo: '', peso: '', diagnostico: '', tratamiento: '', observaciones: '' }

// Registro y edición de una atención (solo veterinario).
//   /mascotas/:mascotaId/atenciones/nueva[?turno=ID]  → alta, opcionalmente desde un turno
//   /atenciones/:id/editar                             → edición
const PASOS_AYUDA = [
  ['estetoscopio', 'Motivo y diagnóstico', 'El motivo es obligatorio. El resto lo podés completar después, editando la atención.'],
  ['historia', 'Peso', 'En kilos, con hasta dos decimales.'],
  ['imagen', 'Imágenes', 'Radiografías, fotos o estudios. Se suben al guardar la atención.'],
]

export default function AtencionForm() {
  const { id, mascotaId } = useParams()
  const [params] = useSearchParams()
  const turnoId = params.get('turno')
  const navegar = useNavigate()
  const { avisar } = useToast()
  const editando = Boolean(id)

  const [form, setForm] = useState(VACIA)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [archivos, setArchivos] = useState([])

  const atencion = useCarga(() => (editando ? api.get(`/atenciones/${id}`) : Promise.resolve(null)), [id])
  const mascota = useCarga(() => (editando ? Promise.resolve(null) : api.get(`/mascotas/${mascotaId}`)), [mascotaId, editando])
  const turno = useCarga(() => (turnoId ? api.get(`/turnos/${turnoId}`) : Promise.resolve(null)), [turnoId])

  // Al editar se completa con lo cargado; al registrar desde un turno se propone su motivo
  useEffect(() => {
    const a = atencion.datos?.atencion
    if (!a) return
    setForm({
      fecha: a.fecha.slice(0, 10),
      motivo: a.motivo,
      peso: a.peso ?? '',
      diagnostico: a.diagnostico || '',
      tratamiento: a.tratamiento || '',
      observaciones: a.observaciones || '',
    })
  }, [atencion.datos])

  useEffect(() => {
    const t = turno.datos?.turno
    if (t?.motivo) setForm((f) => (f.motivo ? f : { ...f, motivo: t.motivo }))
  }, [turno.datos])

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const guardar = async (e) => {
    e.preventDefault()
    setError('')

    // se revisan las imágenes antes de guardar, para no dejar la atención a medias
    for (const archivo of archivos) {
      const problema = errorDeImagen(archivo)
      if (problema) return setError(`La imagen "${archivo.name}" no se puede subir: ${problema}`)
    }
    setGuardando(true)

    const cuerpo = {
      fecha: form.fecha,
      motivo: form.motivo,
      peso: form.peso === '' ? null : Number(form.peso),
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      observaciones: form.observaciones,
    }

    try {
      let resultado
      if (editando) {
        resultado = await api.put(`/atenciones/${id}`, cuerpo)
      } else {
        resultado = await api.post('/atenciones', { ...cuerpo, mascota_id: Number(mascotaId), turno_id: turnoId ? Number(turnoId) : null })
      }
      // las imágenes se suben una vez creada la atención (necesitan su id)
      const fallidas = []
      if (!editando) {
        for (const archivo of archivos) {
          try {
            const url = await subirACloudinary(archivo)
            await api.post('/imagenes', { atencion_id: resultado.atencion.id, url, descripcion: '' })
          } catch {
            fallidas.push(archivo.name)
          }
        }
      }
      const aviso = fallidas.length ? `La atención se guardó, pero no se pudieron subir: ${fallidas.join(', ')}. Podés agregarlas de nuevo acá abajo.` : null
      avisar(editando ? 'Cambios guardados.' : 'Atención registrada.')
      navegar(`/atenciones/${resultado.atencion.id}`, { state: { aviso } })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  if (atencion.cargando || mascota.cargando || turno.cargando) return <Cargando />

  const nombreMascota = editando ? atencion.datos?.atencion.mascota : mascota.datos?.mascota.nombre
  const volver = editando ? `/atenciones/${id}` : `/mascotas/${mascotaId}`
  const t = turno.datos?.turno

  return (
    <div>
      <Titulo>{editando ? 'Editar atención' : 'Registrar atención'}</Titulo>
      <Aviso tipo="error">{atencion.error || mascota.error || turno.error}</Aviso>

      <DosColumnas lateral={<PanelAyuda titulo="Cómo cargarla" pasos={PASOS_AYUDA} />}>
      <form onSubmit={guardar} className="space-y-4 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
        <Aviso tipo="error">{error}</Aviso>
        {nombreMascota && <p>Mascota: <span className="font-semibold">{nombreMascota}</span></p>}
        {t && <Aviso tipo="info">Atención del turno del {fechaLegible(t.fecha)} a las {t.hora} hs. Al guardarla, el turno pasa a atendido.</Aviso>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="fecha" etiqueta="Fecha" type="date" max={hoy()} required value={form.fecha} onChange={cambiar('fecha')} />
          <Campo id="peso" etiqueta="Peso en kg (opcional)" type="number" min="0.01" max="999.99" step="0.01" value={form.peso} onChange={cambiar('peso')} />
        </div>
        <Campo id="motivo" etiqueta="Motivo de la consulta" required maxLength={255} value={form.motivo} onChange={cambiar('motivo')} />
        <AreaTexto id="diagnostico" etiqueta="Diagnóstico" maxLength={5000} value={form.diagnostico} onChange={cambiar('diagnostico')} />
        <AreaTexto id="tratamiento" etiqueta="Tratamiento" maxLength={5000} value={form.tratamiento} onChange={cambiar('tratamiento')} />
        <AreaTexto id="observaciones" etiqueta="Observaciones" maxLength={5000} value={form.observaciones} onChange={cambiar('observaciones')} />

        {!editando && (
          <div>
            <SelectorImagenes id="imagenes" etiqueta="Imágenes (opcional)" multiple archivos={archivos} onChange={setArchivos} />
            <p className="mt-1 text-sm text-tinta/70">Radiografías, fotos o estudios. Se suben al guardar la atención.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Guardar atención'}</Boton>
          <EnlaceBoton to={volver} variante="secundario">Cancelar</EnlaceBoton>
        </div>
      </form>
      </DosColumnas>
    </div>
  )
}
