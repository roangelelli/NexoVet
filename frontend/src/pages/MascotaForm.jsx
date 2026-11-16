import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Campo, Cargando, Casilla, Select, Titulo } from '../components/ui'
import { hoy } from '../utils'

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

  const [form, setForm] = useState(VACIA)
  const [razas, setRazas] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const especies = useCarga(() => api.get('/catalogos/especies'), [])
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
        navegar(`/mascotas/${id}`)
      } else {
        if (usuario.rol !== 'cliente') cuerpo.cliente_id = Number(clienteId)
        const { mascota: nueva } = await api.post('/mascotas', cuerpo)
        navegar(`/mascotas/${nueva.id}`)
      }
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  if (especies.cargando || mascota.cargando) return <Cargando />

  const volver = editando ? `/mascotas/${id}` : usuario.rol === 'cliente' ? '/mascotas' : `/clientes/${clienteId}`

  return (
    <div className="max-w-lg">
      <Titulo>{editando ? 'Editar mascota' : 'Nueva mascota'}</Titulo>
      <Aviso tipo="error">{especies.error || mascota.error}</Aviso>

      <form onSubmit={guardar} className="space-y-4 rounded-xl bg-white p-5">
        <Aviso tipo="error">{error}</Aviso>
        <Campo id="nombre" etiqueta="Nombre" required maxLength={80} value={form.nombre} onChange={cambiar('nombre')} />

        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="fecha_nacimiento" etiqueta="Fecha de nacimiento (opcional)" type="date" max={hoy()} value={form.fecha_nacimiento} onChange={cambiar('fecha_nacimiento')} />
          <Campo id="color" etiqueta="Color (opcional)" maxLength={50} value={form.color} onChange={cambiar('color')} />
        </div>
        <Campo id="microchip" etiqueta="Microchip (opcional)" maxLength={50} value={form.microchip} onChange={cambiar('microchip')} />
        <Casilla id="esterilizado" etiqueta="Está esterilizado/a" checked={form.esterilizado} onChange={(e) => setForm({ ...form, esterilizado: e.target.checked })} />

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" cargando={guardando}>{editando ? 'Guardar cambios' : 'Crear mascota'}</Boton>
          <Link to={volver} className="inline-flex min-h-11 items-center rounded-lg border border-arena bg-white px-4 font-semibold hover:bg-arena">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
