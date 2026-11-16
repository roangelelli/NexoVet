import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Celda, Cargando, EnlaceBoton, Fila, Tabla, Titulo, Vacio } from '../components/ui'

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
      <Titulo accion={<EnlaceBoton to="/clientes/nuevo" icono="mas">Nuevo cliente</EnlaceBoton>}>
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
        <Boton type="submit" variante="secundario" icono="buscar">Buscar</Boton>
      </form>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}

      {datos && datos.clientes.length === 0 && (
        <Vacio>{buscar ? `No hay clientes que coincidan con "${buscar}".` : 'Todavía no hay clientes cargados. Creá el primero con "Nuevo cliente".'}</Vacio>
      )}

      {datos && datos.clientes.length > 0 && (
        <Tabla columnas={['Cliente', 'Email', 'Teléfono']}>
          {datos.clientes.map((c) => (
            <Fila key={c.id}>
              <Celda><Link to={`/clientes/${c.id}`} className="font-semibold text-mar underline">{c.apellido}, {c.nombre}</Link></Celda>
              <Celda etiqueta="Email">{c.email}</Celda>
              <Celda etiqueta="Teléfono">{c.telefono || '—'}</Celda>
            </Fila>
          ))}
        </Tabla>
      )}
    </div>
  )
}
