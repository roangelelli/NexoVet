import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import HistoriaClinica from '../components/HistoriaClinica'
import { Aviso, BotonConfirmar, Cargando, EnlaceBoton, Titulo } from '../components/ui'
import { edadTexto, fechaLegible } from '../utils'

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-sm text-tinta/70">{etiqueta}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}

export default function MascotaFicha() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const { datos, cargando, error } = useCarga(() => api.get(`/mascotas/${id}`), [id])
  const clienteId = datos?.mascota.cliente_id
  const dueno = useCarga(() => (usuario.rol === 'cliente' || !clienteId ? Promise.resolve(null) : api.get(`/clientes/${clienteId}`)), [clienteId, usuario.rol])
  const [errorBaja, setErrorBaja] = useState('')
  const [dandoBaja, setDandoBaja] = useState(false)

  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const m = datos.mascota
  const esCliente = usuario.rol === 'cliente'
  const volver = esCliente ? '/mascotas' : `/clientes/${m.cliente_id}`

  const darDeBaja = async () => {
    setDandoBaja(true)
    try {
      await api.delete(`/mascotas/${id}`)
      navegar(volver)
    } catch (err) {
      setErrorBaja(err.message)
      setDandoBaja(false)
    }
  }

  return (
    <div className="space-y-6">
      <Titulo accion={
        <span className="flex flex-wrap gap-2">
          <EnlaceBoton to={`/turnos/nuevo?mascota=${id}`}>Pedir turno</EnlaceBoton>
          <EnlaceBoton to={`/mascotas/${id}/editar`} variante="secundario">Editar</EnlaceBoton>
        </span>
      }>
        {m.nombre}
      </Titulo>

      <dl className="grid gap-4 rounded-xl bg-white p-5 sm:grid-cols-2">
        {!esCliente && (
          <Dato etiqueta="Dueño">
            {dueno.datos ? <Link to={`/clientes/${m.cliente_id}`} className="text-mar underline">{dueno.datos.cliente.nombre} {dueno.datos.cliente.apellido}</Link> : '—'}
          </Dato>
        )}
        <Dato etiqueta="Especie">{m.especie === 'Otro' ? m.especie_otra : m.especie}</Dato>
        <Dato etiqueta="Raza">{m.raza || '—'}</Dato>
        <Dato etiqueta="Sexo">{m.sexo === 'macho' ? 'Macho' : 'Hembra'}</Dato>
        <Dato etiqueta="Edad">{edadTexto(m.fecha_nacimiento)}</Dato>
        <Dato etiqueta="Fecha de nacimiento">{fechaLegible(m.fecha_nacimiento)}</Dato>
        <Dato etiqueta="Color">{m.color || '—'}</Dato>
        <Dato etiqueta="Microchip">{m.microchip || '—'}</Dato>
        <Dato etiqueta="Esterilizado/a">{m.esterilizado ? 'Sí' : 'No'}</Dato>
      </dl>

      <HistoriaClinica mascotaId={id} puedeRegistrar={usuario.rol === 'veterinario'} />

      <Aviso tipo="info">Las vacunas de {m.nombre} se suman en la próxima etapa.</Aviso>

      <Aviso tipo="error">{errorBaja}</Aviso>
      <div className="flex flex-wrap items-center gap-3">
        <BotonConfirmar texto="Dar de baja" textoConfirmar="Sí, dar de baja" onConfirmar={darDeBaja} cargando={dandoBaja} />
        <Link to={volver} className="text-mar underline">{esCliente ? 'Volver a mis mascotas' : 'Volver al cliente'}</Link>
      </div>
    </div>
  )
}
