import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, AreaTexto, Boton, Campo, Cargando, Titulo } from '../components/ui'
import { fechaLegible, hoy } from '../utils'

const VACIA = { fecha: hoy(), motivo: '', peso: '', diagnostico: '', tratamiento: '', observaciones: '' }

// Registro y edición de una atención (solo veterinario).
//   /mascotas/:mascotaId/atenciones/nueva[?turno=ID]  → alta, opcionalmente desde un turno
//   /atenciones/:id/editar                             → edición
export default function AtencionForm() {
  const { id, mascotaId } = useParams()
  const [params] = useSearchParams()
  const turnoId = params.get('turno')
  const navegar = useNavigate()
  const editando = Boolean(id)

  const [form, setForm] = useState(VACIA)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

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
      navegar(`/atenciones/${resultado.atencion.id}`)
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
    <div className="max-w-2xl">
      <Titulo>{editando ? 'Editar atención' : 'Registrar atención'}</Titulo>
      <Aviso tipo="error">{atencion.error || mascota.error || turno.error}</Aviso>

      <form onSubmit={guardar} className="space-y-4 rounded-xl bg-white p-5">
        <Aviso tipo="error">{error}</Aviso>
        {nombreMascota && <p>Mascota: <span className="font-semibold">{nombreMascota}</span></p>}
        {t && <Aviso tipo="info">Atención del turno del {fechaLegible(t.fecha)} a las {t.hora} hs. Al guardarla, el turno pasa a atendido.</Aviso>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="fecha" etiqueta="Fecha" type="date" max={hoy()} required value={form.fecha} onChange={cambiar('fecha')} />
          <Campo id="peso" etiqueta="Peso en kg (opcional)" type="number" min="0.01" max="999.99" step="0.01" value={form.peso} onChange={cambiar('peso')} />
        </div>
        <Campo id="motivo" etiqueta="Motivo de la consulta" required maxLength={255} value={form.motivo} onChange={cambiar('motivo')} />
        <AreaTexto id="diagnostico" etiqueta="Diagnóstico" maxLength={5000} value={form.diagnostico} onChange={cambiar('diagnostico')} />
        <AreaTexto id="tratamiento" etiqueta="Tratamiento" maxLength={5000} value={form.tratamiento} onChange={cambiar('tratamiento')} />
        <AreaTexto id="observaciones" etiqueta="Observaciones" maxLength={5000} value={form.observaciones} onChange={cambiar('observaciones')} />

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Guardar atención'}</Boton>
          <Link to={volver} className="inline-flex min-h-11 items-center rounded-lg border border-arena bg-white px-4 font-semibold hover:bg-arena">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
