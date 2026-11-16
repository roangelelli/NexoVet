import { useState } from 'react'
import { Aviso, Boton, Campo } from './ui'

// Formulario para crear una cuenta de cliente. Lo usan el autorregistro y el alta por el personal.
export default function FormCuenta({ textoBoton, onEnviar }) {
  const [datos, setDatos] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '', repetir: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setError('')

    if (datos.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (datos.password !== datos.repetir) return setError('Las contraseñas no coinciden.')

    setEnviando(true)
    try {
      const { repetir, ...paraEnviar } = datos
      await onEnviar({ ...paraEnviar, telefono: datos.telefono.trim() || undefined })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Aviso tipo="error">{error}</Aviso>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="nombre" etiqueta="Nombre" required maxLength={80} autoComplete="given-name" value={datos.nombre} onChange={cambiar('nombre')} />
        <Campo id="apellido" etiqueta="Apellido" required maxLength={80} autoComplete="family-name" value={datos.apellido} onChange={cambiar('apellido')} />
      </div>
      <Campo id="email" etiqueta="Email" type="email" required maxLength={150} autoComplete="email" value={datos.email} onChange={cambiar('email')} />
      <Campo id="telefono" etiqueta="Teléfono (opcional)" type="tel" maxLength={30} autoComplete="tel" value={datos.telefono} onChange={cambiar('telefono')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="password" etiqueta="Contraseña" type="password" required autoComplete="new-password" ayuda="Mínimo 8 caracteres." value={datos.password} onChange={cambiar('password')} />
        <Campo id="repetir" etiqueta="Repetir contraseña" type="password" required autoComplete="new-password" value={datos.repetir} onChange={cambiar('repetir')} />
      </div>
      <Boton type="submit" cargando={enviando} className="w-full sm:w-auto">{textoBoton}</Boton>
    </form>
  )
}
