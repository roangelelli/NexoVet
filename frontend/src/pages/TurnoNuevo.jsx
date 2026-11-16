import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Campo, Cargando, DosColumnas, EnlaceBoton, PanelAyuda, Select, Titulo, Vacio } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { etiquetaDia, hoy } from '../utils'

const PASOS = [
  ['huella', 'Elegí a tu mascota', 'Para quién es el turno.'],
  ['calendario', 'Elegí el día', 'Te mostramos los horarios libres de ese día.'],
  ['reloj', 'Elegí el horario y reservá', 'Si querés, contanos el motivo de la consulta.'],
  ['calendario-ok', 'La clínica lo confirma', 'El turno queda "Solicitado" hasta que lo confirmen. Lo ves en Turnos y podés cancelarlo.'],
]

// Pedir un turno: se elige mascota, día y una franja libre.
// El personal llega desde la ficha de la mascota (/turnos/nuevo?mascota=ID); el cliente elige entre las suyas.
export default function TurnoNuevo() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const { avisar } = useToast()
  const [params] = useSearchParams()
  const esCliente = usuario.rol === 'cliente'
  const mascotaUrl = params.get('mascota')

  const mascotas = useCarga(() => (esCliente ? api.get('/mascotas') : mascotaUrl ? api.get(`/mascotas/${mascotaUrl}`) : Promise.resolve(null)), [esCliente, mascotaUrl])

  const [mascotaId, setMascotaId] = useState(mascotaUrl || '')
  const [fecha, setFecha] = useState('')
  const [franjas, setFranjas] = useState(null) // null = todavía no se eligió día
  const [hora, setHora] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const elegirFecha = async (e) => {
    const nueva = e.target.value
    setFecha(nueva)
    setHora('')
    setError('')
    setFranjas(null)
    if (!nueva) return
    try {
      const datos = await api.get(`/disponibilidad/franjas?fecha=${nueva}`)
      setFranjas(datos.franjas)
    } catch (err) {
      setError(err.message)
    }
  }

  const reservar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await api.post('/turnos', { mascota_id: Number(mascotaId), fecha, hora, motivo })
      const nombre = mascotas.datos?.mascota?.nombre || mascotas.datos?.mascotas?.find((m) => String(m.id) === String(mascotaId))?.nombre
      avisar(`Turno solicitado${nombre ? ` para ${nombre}` : ''}: ${etiquetaDia(fecha)} a las ${hora.slice(0, 5)} hs. La clínica lo va a confirmar.`)
      navegar('/turnos')
    } catch (err) {
      setError(err.message)
      setEnviando(false)
      // si la franja se ocupó mientras tanto, se actualiza la lista
      if (err.status === 409) elegirFecha({ target: { value: fecha } })
    }
  }

  if (mascotas.cargando) return <Cargando />
  if (!esCliente && !mascotaUrl) {
    return (
      <div className="max-w-lg">
        <Titulo>Pedir turno</Titulo>
        <Aviso tipo="info">Para dar un turno, entrá a la ficha de la mascota y tocá "Pedir turno".</Aviso>
      </div>
    )
  }

  const lista = esCliente ? mascotas.datos?.mascotas || [] : []
  const mascotaFija = !esCliente ? mascotas.datos?.mascota : null

  return (
    <div>
      <Titulo>Pedir turno</Titulo>
      <Aviso tipo="error">{mascotas.error}</Aviso>

      {esCliente && lista.length === 0 && !mascotas.error && (
        <Vacio>Para pedir un turno primero cargá una mascota en <Link to="/mascotas" className="text-mar underline">Mis mascotas</Link>.</Vacio>
      )}

      {(mascotaFija || lista.length > 0) && (
        <DosColumnas lateral={<PanelAyuda titulo="Cómo funciona" pasos={PASOS} />}>
        <form onSubmit={reservar} className="space-y-4 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
          <Aviso tipo="error">{error}</Aviso>

          {mascotaFija ? (
            <p>Turno para <span className="font-semibold">{mascotaFija.nombre}</span></p>
          ) : (
            <Select id="mascota" etiqueta="Mascota" required value={mascotaId} onChange={(e) => setMascotaId(e.target.value)}>
              <option value="">Elegí una mascota</option>
              {lista.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </Select>
          )}

          <Campo id="fecha" etiqueta="Día" type="date" min={hoy()} required value={fecha} onChange={elegirFecha} />

          {franjas && franjas.length === 0 && (
            <Aviso tipo="info">No hay horarios libres ese día. Probá con otro.</Aviso>
          )}
          {franjas && franjas.length > 0 && (
            <fieldset>
              <legend className="mb-1 text-sm font-medium">Horario</legend>
              <div className="flex flex-wrap gap-2">
                {franjas.map((f) => (
                  <label key={f} className={`inline-flex min-h-11 min-w-20 cursor-pointer items-center justify-center rounded-lg border px-3 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pomelo ${hora === f ? 'border-mar bg-mar text-white' : 'border-arena bg-white hover:bg-arena'}`}>
                    <input type="radio" name="hora" value={f} className="sr-only" checked={hora === f} onChange={() => setHora(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <Campo id="motivo" etiqueta="Motivo de la consulta (opcional)" maxLength={255} value={motivo} onChange={(e) => setMotivo(e.target.value)} />

          <div className="flex flex-wrap gap-2">
            <Boton type="submit" cargando={enviando} disabled={!hora || !(mascotaFija || mascotaId)}>Reservar turno</Boton>
            <EnlaceBoton to="/turnos" variante="secundario">Cancelar</EnlaceBoton>
          </div>
        </form>
        </DosColumnas>
      )}
    </div>
  )
}
