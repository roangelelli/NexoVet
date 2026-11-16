import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormCuenta from '../components/FormCuenta'

export default function Registro() {
  const { usuario, registrarse } = useAuth()

  // Al registrarse queda con la sesión iniciada y pasa al inicio
  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-mar">Creá tu cuenta</h1>
        <p className="text-tinta/70">Con tu cuenta podés pedir turnos y ver los datos de tus mascotas.</p>
        <FormCuenta textoBoton="Crear cuenta" onEnviar={registrarse} />
        <p className="text-sm">
          ¿Ya tenés cuenta? <Link to="/login" className="font-semibold text-mar underline">Ingresá</Link>
        </p>
      </div>
    </div>
  )
}
