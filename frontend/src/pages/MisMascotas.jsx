import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Cargando, EnlaceBoton, Titulo, Vacio } from '../components/ui'
import { AvatarMascota } from '../components/Animales'
import { edadTexto } from '../utils'

export default function MisMascotas() {
  const { datos, cargando, error } = useCarga(() => api.get('/mascotas'), [])

  return (
    <div>
      <Titulo accion={<EnlaceBoton to="/mascotas/nueva" icono="mas">Agregar mascota</EnlaceBoton>}>
        Mis mascotas
      </Titulo>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && datos.mascotas.length === 0 && <Vacio>Todavía no cargaste ninguna mascota. Tocá "Agregar mascota" para empezar.</Vacio>}
      {datos && datos.mascotas.length > 0 && (
        <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
          {datos.mascotas.map((m) => (
            <li key={m.id}>
              <Link to={`/mascotas/${m.id}`} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-arena/60">
                <AvatarMascota especie={m.especie} tamano="size-14" />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-semibold text-mar">{m.nombre}</span>
                  <span className="block text-tinta/70">
                    {m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''} · {edadTexto(m.fecha_nacimiento)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
