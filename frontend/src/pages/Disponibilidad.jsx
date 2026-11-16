import { useState } from 'react'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Campo, Cargando, Select, Titulo, Vacio } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { fechaLegible, hoy } from '../utils'

const textoDuracion = (minutos) => (minutos === 60 ? '1 hora' : `${minutos} minutos`)

const DIAS = [
  ['lunes', 'Lunes'], ['martes', 'Martes'], ['miercoles', 'Miércoles'], ['jueves', 'Jueves'],
  ['viernes', 'Viernes'], ['sabado', 'Sábado'], ['domingo', 'Domingo'],
]

// Configuración de la agenda general: duración del turno, horarios de atención y días sin atención
export default function Disponibilidad() {
  const { datos, cargando, error, recargar } = useCarga(() => api.get('/disponibilidad'), [])
  const { avisar } = useToast()
  const [mensaje, setMensaje] = useState({ tipo: 'error', texto: '' })

  const [duracion, setDuracion] = useState('')
  const [tramo, setTramo] = useState({ dia_semana: 'lunes', hora_inicio: '09:00', hora_fin: '13:00' })
  const [bloqueo, setBloqueo] = useState({ fecha: '', motivo: '' })

  // Ejecuta una acción, avisa el resultado y recarga la configuración
  const ejecutar = async (accion, textoOk) => {
    setMensaje({ tipo: 'error', texto: '' })
    try {
      await accion()
      avisar(textoOk)
      recargar()
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    }
  }

  const guardarDuracion = (e) => {
    e.preventDefault()
    ejecutar(() => api.put('/disponibilidad/duracion', { duracion_turno_min: Number(valorDuracion) }), 'Duración guardada.')
  }
  const agregarTramo = (e) => {
    e.preventDefault()
    ejecutar(() => api.post('/disponibilidad/tramos', tramo), 'Horario agregado.')
  }
  const agregarBloqueo = (e) => {
    e.preventDefault()
    ejecutar(async () => {
      await api.post('/disponibilidad/dias-bloqueados', { fecha: bloqueo.fecha, motivo: bloqueo.motivo })
      setBloqueo({ fecha: '', motivo: '' })
    }, 'Día bloqueado.')
  }

  if (cargando && !datos) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const duracionActual = datos.duracion_turno_min
  const valorDuracion = duracion || String(duracionActual)
  // si la duración guardada no es una de las opciones comunes, también se ofrece
  const opcionesDuracion = [...new Set([15, 30, 45, 60, duracionActual])].sort((a, b) => a - b)

  return (
    <div className="space-y-8">
      <Titulo>Disponibilidad</Titulo>
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Horarios de atención</h2>
        <div className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
          {DIAS.map(([clave, nombre]) => {
            const tramos = datos.tramos.filter((t) => t.dia_semana === clave)
            return (
              <div key={clave} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
                <span className="w-28 font-semibold">{nombre}</span>
                {tramos.length === 0 && <span className="text-tinta/70">Sin atención</span>}
                {tramos.map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-2 rounded-lg bg-bruma px-3 py-1">
                    {t.hora_inicio} a {t.hora_fin} hs
                    <button type="button" className="min-h-8 px-1 font-semibold text-error underline"
                      aria-label={`Quitar horario de ${nombre} ${t.hora_inicio} a ${t.hora_fin}`}
                      onClick={() => ejecutar(() => api.delete(`/disponibilidad/tramos/${t.id}`), 'Horario quitado.')}>
                      Quitar
                    </button>
                  </span>
                ))}
              </div>
            )
          })}
        </div>

        <form onSubmit={agregarTramo} className="flex flex-wrap items-end gap-3 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
          <Select id="dia" etiqueta="Día" value={tramo.dia_semana} onChange={(e) => setTramo({ ...tramo, dia_semana: e.target.value })}>
            {DIAS.map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
          </Select>
          <Campo id="desde" etiqueta="Desde" type="time" required value={tramo.hora_inicio} onChange={(e) => setTramo({ ...tramo, hora_inicio: e.target.value })} />
          <Campo id="hasta" etiqueta="Hasta" type="time" required value={tramo.hora_fin} onChange={(e) => setTramo({ ...tramo, hora_fin: e.target.value })} />
          <Boton type="submit">Agregar horario</Boton>
        </form>
      </section>


        <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Duración del turno</h2>
        <form onSubmit={guardarDuracion} className="flex flex-wrap items-end gap-3 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
          <Select id="duracion" etiqueta="Duración de cada turno" className="w-56" value={valorDuracion} onChange={(e) => setDuracion(e.target.value)}>
            {opcionesDuracion.map((minutos) => <option key={minutos} value={minutos}>{textoDuracion(minutos)}</option>)}
          </Select>
          <Boton type="submit">Guardar duración</Boton>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Días sin atención</h2>
        {datos.dias_bloqueados.length === 0 && <Vacio>No hay días bloqueados. Agregá feriados o cierres con el formulario de abajo.</Vacio>}
        {datos.dias_bloqueados.length > 0 && (
          <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
            {datos.dias_bloqueados.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span><span className="font-semibold">{fechaLegible(d.fecha)}</span>{d.motivo ? ` · ${d.motivo}` : ''}</span>
                <button type="button" className="min-h-8 px-1 font-semibold text-error underline"
                  onClick={() => ejecutar(() => api.delete(`/disponibilidad/dias-bloqueados/${d.id}`), 'Día desbloqueado.')}>
                  Desbloquear
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={agregarBloqueo} className="flex flex-wrap items-end gap-3 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
          <Campo id="fecha" etiqueta="Fecha" type="date" min={hoy()} required value={bloqueo.fecha} onChange={(e) => setBloqueo({ ...bloqueo, fecha: e.target.value })} />
          <Campo id="motivo" etiqueta="Motivo (opcional)" maxLength={150} value={bloqueo.motivo} onChange={(e) => setBloqueo({ ...bloqueo, motivo: e.target.value })} className="min-w-56 flex-1" />
          <Boton type="submit">Bloquear día</Boton>
        </form>
      </section>
        </div>
      </div>
    </div>
  )
}
