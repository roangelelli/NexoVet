import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Cargando, Titulo, Vacio } from '../components/ui'

export default function Clientes() {
  const [texto, setTexto] = useState('')
  const [buscar, setBuscar] = useState('')
  const { datos, cargando, error } = useCarga(
    () => api.get(`/clientes?buscar=${encodeURIComponent(buscar)}`),
    [buscar],
  )

  const enviarBusqueda = (e) => {
    e.preventDefault()
    setBuscar(texto.trim())
  }

  return (
    <div>
      <Titulo accion={<Link to="/clientes/nuevo" className="inline-flex min-h-11 items-center rounded-lg bg-mar px-4 font-semibold text-white hover:bg-mar-oscuro">Nuevo cliente</Link>}>
        Clientes
      </Titulo>

      <form onSubmit={enviarBusqueda} className="mb-4 flex gap-2">
        <input
          type="search"
          aria-label="Buscar clientes"
          placeholder="Buscar por nombre, apellido o email"
          className="min-h-11 flex-1 rounded-lg border border-arena bg-white px-3"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Boton type="submit" variante="secundario">Buscar</Boton>
      </form>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}

      {datos && datos.clientes.length === 0 && (
        <Vacio>{buscar ? `No hay clientes que coincidan con "${buscar}".` : 'Todavía no hay clientes cargados. Creá el primero con "Nuevo cliente".'}</Vacio>
      )}

      {datos && datos.clientes.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-arena text-sm text-tinta/70">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena">
              {datos.clientes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link to={`/clientes/${c.id}`} className="font-semibold text-mar underline">{c.apellido}, {c.nombre}</Link>
                  </td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.telefono || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
