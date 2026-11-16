import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormCuenta from '../components/FormCuenta'
import PantallaAcceso from '../components/PantallaAcceso'

export default function Registro() {
  const { usuario, registrarse } = useAuth()

  // Al registrarse queda con la sesión iniciada y pasa al inicio
  if (usuario) return <Navigate to="/" replace />

  return (
    <PantallaAcceso titulo="Crear cuenta" ancho="max-w-lg">
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Creá tu cuenta</h1>
          <p className="text-tinta/70">Con tu cuenta podés pedir turnos y ver los datos de tus mascotas.</p>
        </div>
        <FormCuenta textoBoton="Crear cuenta" onEnviar={registrarse} />
        <p className="text-sm">
          ¿Ya tenés cuenta? <Link to="/login" className="font-semibold text-mar underline">Ingresá</Link>
        </p>
      </div>
    </PantallaAcceso>
  )
}
