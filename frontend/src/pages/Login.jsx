import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Aviso, Boton, Campo } from '../components/ui'

export default function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/" replace />

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(email, password)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-mar">NexoVet</h1>
        <p className="text-tinta/70">Ingresá con tu cuenta para ver tus turnos y mascotas.</p>
        <Aviso tipo="error">{error}</Aviso>
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo id="password" etiqueta="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Boton type="submit" cargando={enviando} className="w-full">Ingresar</Boton>
        <p className="text-center text-sm">
          ¿Todavía no tenés cuenta? <Link to="/registro" className="font-semibold text-mar underline">Registrate</Link>
        </p>
      </form>
    </div>
  )
}
