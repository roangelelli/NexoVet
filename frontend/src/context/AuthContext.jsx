import { createContext, useContext, useEffect, useState } from 'react'
import { api, borrarToken, guardarToken, leerToken, registrarVencimiento } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(Boolean(leerToken())) // hay token: falta validarlo

  const cerrarSesion = () => {
    borrarToken()
    setUsuario(null)
  }

  // Al abrir la app, si quedó un token guardado se valida contra el backend
  useEffect(() => {
    registrarVencimiento(cerrarSesion)
    if (!leerToken()) return
    api.get('/auth/me')
      .then((datos) => setUsuario(datos.usuario))
      .catch(cerrarSesion)
      .finally(() => setCargando(false))
  }, [])

  const iniciarSesion = async (email, password) => {
    const datos = await api.post('/auth/login', { email, password })
    guardarToken(datos.token)
    setUsuario(datos.usuario)
  }

  const registrarse = async (formulario) => {
    const datos = await api.post('/auth/registro', formulario)
    guardarToken(datos.token)
    setUsuario(datos.usuario)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
