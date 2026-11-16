import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Aviso, Boton, Campo } from '../components/ui'
import PantallaAcceso from '../components/PantallaAcceso'

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
    <PantallaAcceso titulo="Ingresar">
      <form onSubmit={enviar} className="space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Te damos la bienvenida</h1>
          <p className="text-tinta/70">Ingresá con tu cuenta para ver tus turnos y mascotas.</p>
        </div>
        <Aviso tipo="error">{error}</Aviso>
        <Campo id="email" etiqueta="Email" icono="mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo id="password" etiqueta="Contraseña" icono="candado" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Boton type="submit" cargando={enviando} className="w-full">Ingresar</Boton>
        <p className="text-center text-sm">
          ¿Todavía no tenés cuenta? <Link to="/registro" className="font-semibold text-mar underline">Registrate</Link>
        </p>
      </form>
    </PantallaAcceso>
  )
}
