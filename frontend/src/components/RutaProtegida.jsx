import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Cargando } from './ui'

// Sin sesión → login. Con sesión pero sin el rol pedido → inicio.
// (El backend valida los permisos igual: esto solo evita mostrar pantallas que no corresponden.)
export default function RutaProtegida({ roles }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />

  return <Outlet />
}
