import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Celda, Cargando, EnlaceBoton, Fila, Tabla, Titulo, Vacio } from '../components/ui'
import { edadTexto } from '../utils'
import { AvatarMascota } from '../components/Animales'
import MisMascotas from './MisMascotas'

// El cliente ve sus mascotas; el personal puede buscar entre todas
export default function Mascotas() {
  const { usuario } = useAuth()
  return usuario.rol === 'cliente' ? <MisMascotas /> : <BuscarMascotas />
}

function BuscarMascotas() {
  const { usuario } = useAuth()
  const esVeterinario = usuario.rol === 'veterinario'
  const [texto, setTexto] = useState('')
  const [buscar, setBuscar] = useState('')
  const mascotas = useCarga(() => api.get(`/mascotas?buscar=${encodeURIComponent(buscar)}`), [buscar])
  const clientes = useCarga(() => api.get('/clientes'), [])

  // La lista de mascotas trae solo el id del dueño: el nombre se toma de la lista de clientes
  const duenos = Object.fromEntries((clientes.datos?.clientes || []).map((c) => [c.id, c]))

  const enviar = (e) => {
    e.preventDefault()
    setBuscar(texto.trim())
  }

  return (
    <div>
      <Titulo accion={<EnlaceBoton to="/mascotas/nueva">Agregar mascota</EnlaceBoton>}>Mascotas</Titulo>

      <form onSubmit={enviar} className="mb-4 flex gap-2">
        <input
          type="search"
          aria-label="Buscar mascotas"
          placeholder="Buscar por nombre de la mascota"
          className="min-h-11 flex-1 rounded-lg border border-arena bg-white px-3"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Boton type="submit" variante="secundario">Buscar</Boton>
      </form>

      <Aviso tipo="error">{mascotas.error}</Aviso>
      {mascotas.cargando && <Cargando />}

      {mascotas.datos && mascotas.datos.mascotas.length === 0 && (
        <Vacio>{buscar ? `No hay mascotas que coincidan con "${buscar}".` : 'Todavía no hay mascotas cargadas. Se agregan desde la ficha de cada cliente.'}</Vacio>
      )}

      {mascotas.datos && mascotas.datos.mascotas.length > 0 && (
        <Tabla columnas={['Mascota', 'Especie y raza', 'Edad', 'Dueño', ...(esVeterinario ? [''] : [])]}>
          {mascotas.datos.mascotas.map((m) => {
            const dueno = duenos[m.cliente_id]
            return (
              <Fila key={m.id}>
                <Celda>
                  <span className="flex items-center gap-3">
                    <AvatarMascota especie={m.especie} tamano="size-10" />
                    <Link to={`/mascotas/${m.id}`} className="font-semibold text-mar underline">{m.nombre}</Link>
                  </span>
                </Celda>
                <Celda etiqueta="Especie y raza">{m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''}</Celda>
                <Celda etiqueta="Edad">{edadTexto(m.fecha_nacimiento)}</Celda>
                <Celda etiqueta="Dueño">
                  {dueno ? <Link to={`/clientes/${dueno.id}`} className="text-mar underline">{dueno.apellido}, {dueno.nombre}</Link> : '—'}
                </Celda>
                {esVeterinario && (
                  <Celda className="md:text-right">
                    <EnlaceBoton to={`/mascotas/${m.id}/atenciones/nueva`} variante="secundario" className="mt-2 w-full md:mt-0 md:w-auto">Atención espontánea</EnlaceBoton>
                  </Celda>
                )}
              </Fila>
            )
          })}
        </Tabla>
      )}
    </div>
  )
}
