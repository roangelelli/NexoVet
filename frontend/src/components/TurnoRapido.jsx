import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Campo, Cargando, Select } from './ui'
import { etiquetaDia } from '../utils'

// Dar un turno en un horario ya elegido: se elige el cliente, su mascota y, si se quiere, el motivo.
// Lo usa recepción desde el panel de horarios libres del inicio.
export default function TurnoRapido({ fecha, hora, onListo, onCancelar }) {
  const clientes = useCarga(() => api.get('/clientes'), [])
  const [clienteId, setClienteId] = useState('')
  const mascotas = useCarga(() => (clienteId ? api.get(`/mascotas?cliente_id=${clienteId}`) : Promise.resolve(null)), [clienteId])
  const [mascotaId, setMascotaId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const lista = mascotas.datos?.mascotas || []

  const elegirCliente = (e) => {
    setClienteId(e.target.value)
    setMascotaId('')
  }

  const reservar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const { turno } = await api.post('/turnos', { mascota_id: Number(mascotaId), fecha, hora, motivo })
      const mascota = lista.find((m) => String(m.id) === mascotaId)
      const cuando = `${etiquetaDia(fecha)} a las ${hora.slice(0, 5)} hs`
      // Un turno que da recepción ya queda confirmado; si no se pudo confirmar, queda como solicitado
      try {
        await api.patch(`/turnos/${turno.id}/confirmar`)
        onListo(`Turno confirmado para ${mascota.nombre}: ${cuando}.`)
      } catch {
        onListo(`Turno reservado para ${mascota.nombre}: ${cuando}. Quedó solicitado: confirmalo desde la agenda.`)
      }
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  if (clientes.cargando && !clientes.datos) return <Cargando />

  return (
    <form onSubmit={reservar} className="space-y-4">
      <p className="rounded-lg bg-mar/10 px-3 py-2 font-semibold text-mar-oscuro">
        {etiquetaDia(fecha)} · {hora.slice(0, 5)} hs
      </p>
      <Aviso tipo="error">{error || clientes.error || mascotas.error}</Aviso>

      <Select id="turno-cliente" etiqueta="Cliente" required value={clienteId} onChange={elegirCliente}>
        <option value="">Elegí un cliente</option>
        {(clientes.datos?.clientes || []).map((c) => (
          <option key={c.id} value={c.id}>{c.apellido}, {c.nombre} · {c.email}</option>
        ))}
      </Select>

      {clienteId && mascotas.datos && lista.length === 0 && (
        <Aviso tipo="info">
          Este cliente todavía no tiene mascotas. Cargala desde <Link to={`/clientes/${clienteId}`} className="font-semibold underline">su ficha</Link> y volvé a elegir el horario.
        </Aviso>
      )}
      {lista.length > 0 && (
        <Select id="turno-mascota" etiqueta="Mascota" required value={mascotaId} onChange={(e) => setMascotaId(e.target.value)}>
          <option value="">Elegí una mascota</option>
          {lista.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </Select>
      )}

      <Campo id="turno-motivo" etiqueta="Motivo de la consulta (opcional)" maxLength={255} value={motivo} onChange={(e) => setMotivo(e.target.value)} />

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" cargando={enviando} disabled={!mascotaId}>Reservar turno</Boton>
        <Boton type="button" variante="secundario" onClick={onCancelar}>Cancelar</Boton>
      </div>
    </form>
  )
}
