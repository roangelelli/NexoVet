import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, BotonConfirmar, Campo, Cargando, Titulo, Vacio } from '../components/ui'
import { edadTexto } from '../utils'

// Ficha del cliente: sus datos editables y sus mascotas.
// Con propio=true la usa el cliente para ver y editar su propio perfil (/perfil).
export default function ClienteFicha({ propio = false }) {
  const { id: idUrl } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const id = propio ? usuario.id : idUrl

  const { datos, cargando, error } = useCarga(() => api.get(`/clientes/${id}`), [id])
  const mascotas = useCarga(() => (propio ? Promise.resolve({ mascotas: [] }) : api.get(`/mascotas?cliente_id=${id}`)), [id, propio])

  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' })
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' })
  const [guardando, setGuardando] = useState(false)
  const [dandoBaja, setDandoBaja] = useState(false)

  useEffect(() => {
    if (datos) setForm({ nombre: datos.cliente.nombre, apellido: datos.cliente.apellido, telefono: datos.cliente.telefono || '' })
  }, [datos])

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const guardar = async (e) => {
    e.preventDefault()
    setMensaje({ tipo: 'ok', texto: '' })
    setGuardando(true)
    try {
      await api.put(`/clientes/${id}`, form)
      setMensaje({ tipo: 'ok', texto: 'Cambios guardados.' })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    }
    setGuardando(false)
  }

  const darDeBaja = async () => {
    setDandoBaja(true)
    try {
      await api.delete(`/clientes/${id}`)
      navegar('/clientes')
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setDandoBaja(false)
    }
  }

  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const { cliente } = datos

  return (
    <div>
      <Titulo>{propio ? 'Mi perfil' : `${cliente.nombre} ${cliente.apellido}`}</Titulo>

      {/* Para el personal: datos a la izquierda y mascotas a la derecha. Para el cliente: solo sus datos. */}
      <div className={propio ? 'max-w-lg' : 'grid items-start gap-8 lg:grid-cols-[24rem_1fr]'}>
        <div className="space-y-4">
          <form onSubmit={guardar} className="space-y-4 rounded-xl bg-white p-5">
            <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Campo id="nombre" etiqueta="Nombre" required maxLength={80} value={form.nombre} onChange={cambiar('nombre')} />
              <Campo id="apellido" etiqueta="Apellido" required maxLength={80} value={form.apellido} onChange={cambiar('apellido')} />
            </div>
            <Campo id="telefono" etiqueta="Teléfono" type="tel" maxLength={30} value={form.telefono} onChange={cambiar('telefono')} />
            <Campo id="email" etiqueta="Email" value={cliente.email} readOnly disabled ayuda="El email no se puede cambiar." />
            <Boton type="submit" cargando={guardando}>Guardar cambios</Boton>
          </form>

          {!propio && (
            <BotonConfirmar texto="Dar de baja al cliente" textoConfirmar="Sí, dar de baja" onConfirmar={darDeBaja} cargando={dandoBaja} />
          )}
        </div>

        {!propio && (
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">Mascotas</h2>
              <Link to={`/clientes/${id}/mascotas/nueva`} className="inline-flex min-h-11 items-center rounded-lg bg-mar px-4 font-semibold text-white hover:bg-mar-oscuro">Agregar mascota</Link>
            </div>
            {mascotas.cargando && <Cargando />}
            <Aviso tipo="error">{mascotas.error}</Aviso>
            {mascotas.datos && mascotas.datos.mascotas.length === 0 && <Vacio>Este cliente todavía no tiene mascotas cargadas.</Vacio>}
            {mascotas.datos && mascotas.datos.mascotas.length > 0 && (
              <ul className="divide-y divide-arena rounded-xl bg-white">
                {mascotas.datos.mascotas.map((m) => (
                  <li key={m.id}>
                    <Link to={`/mascotas/${m.id}`} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-bruma">
                      <span className="font-semibold text-mar">{m.nombre}</span>
                      <span className="text-tinta/70">{m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''} · {edadTexto(m.fecha_nacimiento)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
