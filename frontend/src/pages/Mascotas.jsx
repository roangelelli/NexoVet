import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Cargando, EnlaceBoton, Titulo, Vacio } from '../components/ui'
import { edadTexto } from '../utils'
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
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-arena text-sm text-tinta/70">
              <tr>
                <th className="px-4 py-3 font-medium">Mascota</th>
                <th className="px-4 py-3 font-medium">Especie y raza</th>
                <th className="px-4 py-3 font-medium">Edad</th>
                <th className="px-4 py-3 font-medium">Dueño</th>
                {esVeterinario && <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-arena">
              {mascotas.datos.mascotas.map((m) => {
                const dueno = duenos[m.cliente_id]
                return (
                  <tr key={m.id}>
                    <td className="px-4 py-3"><Link to={`/mascotas/${m.id}`} className="font-semibold text-mar underline">{m.nombre}</Link></td>
                    <td className="px-4 py-3">{m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''}</td>
                    <td className="px-4 py-3">{edadTexto(m.fecha_nacimiento)}</td>
                    <td className="px-4 py-3">
                      {dueno ? <Link to={`/clientes/${dueno.id}`} className="text-mar underline">{dueno.apellido}, {dueno.nombre}</Link> : '—'}
                    </td>
                    {esVeterinario && (
                      <td className="px-4 py-2 text-right">
                        <EnlaceBoton to={`/mascotas/${m.id}/atenciones/nueva`} variante="secundario">Atención espontánea</EnlaceBoton>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
