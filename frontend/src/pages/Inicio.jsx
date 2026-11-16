import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SECCIONES } from '../secciones'
import ProximosTurnos from '../components/ProximosTurnos'
import { EnlaceBoton, Titulo } from '../components/ui'

export default function Inicio() {
  const { usuario } = useAuth()
  const accesos = SECCIONES.filter((s) => s.descripcion && s.roles.includes(usuario.rol))

  return (
    <div>
      <Titulo>Hola, {usuario.nombre}</Titulo>
      <ul className="divide-y divide-arena rounded-xl bg-white">
        {accesos.map((s) => (
          <li key={s.ruta}>
            <Link to={s.ruta} className="block px-4 py-4 hover:bg-arena/60">
              <span className="font-display text-xl font-semibold text-mar">{s.texto}</span>
              <span className="mt-0.5 block text-tinta/70">{s.descripcion}</span>
            </Link>
          </li>
        ))}
      </ul>

      {usuario.rol === 'veterinario' && (
        <>
          <div className="mt-8">
            <EnlaceBoton to="/mascotas">Atención espontánea</EnlaceBoton>
          </div>
          <ProximosTurnos />
        </>
      )}
    </div>
  )
}
