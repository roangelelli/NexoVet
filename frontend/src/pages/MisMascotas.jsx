import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Cargando, Titulo, Vacio } from '../components/ui'
import { edadTexto } from '../utils'

export default function MisMascotas() {
  const { datos, cargando, error } = useCarga(() => api.get('/mascotas'), [])

  return (
    <div>
      <Titulo accion={<Link to="/mascotas/nueva" className="inline-flex min-h-11 items-center rounded-lg bg-mar px-4 font-semibold text-white hover:bg-mar-oscuro">Agregar mascota</Link>}>
        Mis mascotas
      </Titulo>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && datos.mascotas.length === 0 && <Vacio>Todavía no cargaste ninguna mascota. Tocá "Agregar mascota" para empezar.</Vacio>}
      {datos && datos.mascotas.length > 0 && (
        <ul className="divide-y divide-arena rounded-xl bg-white">
          {datos.mascotas.map((m) => (
            <li key={m.id}>
              <Link to={`/mascotas/${m.id}`} className="block px-4 py-4 hover:bg-bruma">
                <span className="font-display text-xl font-semibold text-mar">{m.nombre}</span>
                <span className="block text-tinta/70">
                  {m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''} · {edadTexto(m.fecha_nacimiento)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
