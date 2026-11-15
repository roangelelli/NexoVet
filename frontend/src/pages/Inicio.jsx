import { useAuth } from '../context/AuthContext'
import { Aviso, Titulo } from '../components/ui'

export default function Inicio() {
  const { usuario } = useAuth()
  return (
    <div>
      <Titulo>Hola, {usuario.nombre}</Titulo>
      <Aviso tipo="info">Sesión iniciada. Las pantallas de cada sección se suman en las próximas etapas.</Aviso>
    </div>
  )
}
