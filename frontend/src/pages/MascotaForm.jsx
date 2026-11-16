import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import FormCuenta from '../components/FormCuenta'
import { Aviso, Boton, Campo, Cargando, Casilla, DosColumnas, EnlaceBoton, Modal, PanelAyuda, Select, Titulo } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { hoy } from '../utils'

const PASOS_AYUDA = [
  ['huella', 'Lo básico', 'Nombre, especie y sexo alcanzan para empezar.'],
  ['historia', 'La raza depende de la especie', 'Elegí primero la especie y después la raza, si la tiene.'],
  ['escudo', 'Microchip y nacimiento', 'Son opcionales, pero ayudan a identificar a la mascota y a calcular su edad.'],
]

const VACIA = { nombre: '', especie_id: '', raza_id: '', especie_otra: '', sexo: '', fecha_nacimiento: '', microchip: '', color: '', esterilizado: false }

// Alta y edición de una mascota.
//   /mascotas/nueva                      → el cliente carga una mascota propia
//   /clientes/:clienteId/mascotas/nueva  → el personal la carga para un cliente
//   /mascotas/:id/editar                 → edición (cliente o personal)
export default function MascotaForm() {
  const { id, clienteId } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const editando = Boolean(id)

  const esPersonal = usuario.rol !== 'cliente'
  const hayQueElegirCliente = esPersonal && !editando && !clienteId
  const [clienteElegido, setClienteElegido] = useState('')
  const [creados, setCreados] = useState([]) // clientes dados de alta desde la ventana flotante
  const [modalCliente, setModalCliente] = useState(false)
  const { avisar } = useToast()
  const [form, setForm] = useState(VACIA)
  const [razas, setRazas] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const especies = useCarga(() => api.get('/catalogos/especies'), [])
  const clientes = useCarga(() => (hayQueElegirCliente ? api.get('/clientes') : Promise.resolve(null)), [hayQueElegirCliente])
  const mascota = useCarga(() => (editando ? api.get(`/mascotas/${id}`) : Promise.resolve(null)), [id])

  // Al editar, se completa el formulario con los datos actuales
  useEffect(() => {
    const m = mascota.datos?.mascota
    if (!m) return
    setForm({
      nombre: m.nombre,
      especie_id: String(m.especie_id),
      raza_id: m.raza_id ? String(m.raza_id) : '',
      especie_otra: m.especie_otra || '',
      sexo: m.sexo,
      fecha_nacimiento: m.fecha_nacimiento ? m.fecha_nacimiento.slice(0, 10) : '',
      microchip: m.microchip || '',
      color: m.color || '',
      esterilizado: Boolean(m.esterilizado),
    })
  }, [mascota.datos])

  const especie = especies.datos?.especies.find((e) => String(e.id) === form.especie_id)
  const esOtro = especie?.nombre === 'Otro'

  // Las razas dependen de la especie elegida
  useEffect(() => {
    if (!form.especie_id || esOtro) return setRazas([])
    api.get(`/catalogos/razas?especie_id=${form.especie_id}`).then((d) => setRazas(d.razas)).catch(() => setRazas([]))
  }, [form.especie_id, esOtro])

  // Alta de cliente sin salir de la pantalla: queda elegido como dueño y se sigue con la mascota
  const crearCliente = async (datos) => {
    const { cliente } = await api.post('/clientes', datos)
    setCreados((lista) => [cliente, ...lista])
    setClienteElegido(String(cliente.id))
    avisar(`Cliente ${cliente.nombre} ${cliente.apellido} creado y elegido como dueño.`)
    setModalCliente(false)
  }

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const cambiarEspecie = (e) => setForm({ ...form, especie_id: e.target.value, raza_id: '', especie_otra: '' })

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const cuerpo = {
      nombre: form.nombre,
      especie_id: Number(form.especie_id),
      raza_id: form.raza_id ? Number(form.raza_id) : null,
      especie_otra: esOtro ? form.especie_otra : null,
      sexo: form.sexo,
      fecha_nacimiento: form.fecha_nacimiento || null,
      microchip: form.microchip,
      color: form.color,
      esterilizado: form.esterilizado,
    }

    try {
      if (editando) {
        await api.put(`/mascotas/${id}`, cuerpo)
        avisar('Cambios guardados.')
        navegar(`/mascotas/${id}`)
      } else {
        if (esPersonal) cuerpo.cliente_id = Number(clienteId || clienteElegido)
        const { mascota: nueva } = await api.post('/mascotas', cuerpo)
        avisar(`Mascota ${nueva.nombre} creada.`)
        navegar(`/mascotas/${nueva.id}`)
      }
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  if (especies.cargando || mascota.cargando || clientes.cargando) return <Cargando />

  const volver = editando ? `/mascotas/${id}` : usuario.rol === 'cliente' || !clienteId ? '/mascotas' : `/clientes/${clienteId}`

  return (
    <div>
      <Titulo>{editando ? 'Editar mascota' : 'Nueva mascota'}</Titulo>
      <Aviso tipo="error">{especies.error || mascota.error || clientes.error}</Aviso>

      <DosColumnas lateral={<PanelAyuda titulo="Qué datos cargar" pasos={PASOS_AYUDA} />}>
      <form onSubmit={guardar} className="space-y-4 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
        <Aviso tipo="error">{error}</Aviso>
        {hayQueElegirCliente && (
          <div className="space-y-1">
            <Select id="cliente" etiqueta="Dueño" required value={clienteElegido} onChange={(e) => setClienteElegido(e.target.value)}>
              <option value="">Elegí un cliente</option>
              {[...creados, ...(clientes.datos?.clientes || [])].map((c) => <option key={c.id} value={c.id}>{c.apellido}, {c.nombre} · {c.email}</option>)}
            </Select>
            <p className="text-sm text-tinta/70">¿El cliente todavía no existe? <button type="button" className="font-semibold text-mar underline" onClick={() => setModalCliente(true)}>Crealo ahora</button>.</p>
          </div>
        )}
        <Campo id="nombre" etiqueta="Nombre" required maxLength={80} value={form.nombre} onChange={cambiar('nombre')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="especie" etiqueta="Especie" required value={form.especie_id} onChange={cambiarEspecie}>
            <option value="">Elegí una especie</option>
            {especies.datos?.especies.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </Select>
          <Select id="sexo" etiqueta="Sexo" required value={form.sexo} onChange={cambiar('sexo')}>
            <option value="">Elegí el sexo</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </Select>
        </div>

        {esOtro && (
          <Campo id="especie_otra" etiqueta="¿Qué especie es?" required maxLength={80} value={form.especie_otra} onChange={cambiar('especie_otra')} />
        )}
        {form.especie_id && !esOtro && (
          <Select id="raza" etiqueta="Raza (opcional)" value={form.raza_id} onChange={cambiar('raza_id')}>
            <option value="">Sin raza definida</option>
            {razas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="fecha_nacimiento" etiqueta="Fecha de nacimiento (opcional)" type="date" max={hoy()} value={form.fecha_nacimiento} onChange={cambiar('fecha_nacimiento')} />
          <Campo id="color" etiqueta="Color (opcional)" maxLength={50} value={form.color} onChange={cambiar('color')} />
        </div>
        <Campo id="microchip" etiqueta="Microchip (opcional)" maxLength={50} value={form.microchip} onChange={cambiar('microchip')} />
        <Casilla id="esterilizado" etiqueta="Está esterilizado/a" checked={form.esterilizado} onChange={(e) => setForm({ ...form, esterilizado: e.target.checked })} />

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Crear mascota'}</Boton>
          <EnlaceBoton to={volver} variante="secundario">Cancelar</EnlaceBoton>
        </div>
      </form>
      </DosColumnas>

      <Modal abierto={modalCliente} titulo="Nuevo cliente" onCerrar={() => setModalCliente(false)}>
        <FormCuenta textoBoton="Crear cliente" onEnviar={crearCliente} />
      </Modal>
    </div>
  )
}
