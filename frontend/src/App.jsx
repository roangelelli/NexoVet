import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import { EnConstruccion } from './components/ui'
import Inicio from './pages/Inicio'
import Login from './pages/Login'

const PERSONAL = ['recepcion', 'veterinario']

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<EnConstruccion nombre="Registro" />} />

      {/* Todo lo de adentro exige sesión */}
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/turnos" element={<EnConstruccion nombre="Turnos" />} />
          <Route path="/mascotas/:id" element={<EnConstruccion nombre="Ficha de la mascota" />} />

          <Route element={<RutaProtegida roles={['cliente']} />}>
            <Route path="/mascotas" element={<EnConstruccion nombre="Mis mascotas" />} />
          </Route>

          <Route element={<RutaProtegida roles={PERSONAL} />}>
            <Route path="/clientes" element={<EnConstruccion nombre="Clientes" />} />
            <Route path="/clientes/:id" element={<EnConstruccion nombre="Ficha del cliente" />} />
            <Route path="/reportes" element={<EnConstruccion nombre="Reportes" />} />
          </Route>

          <Route element={<RutaProtegida roles={['recepcion']} />}>
            <Route path="/disponibilidad" element={<EnConstruccion nombre="Disponibilidad" />} />
          </Route>

          <Route path="*" element={<EnConstruccion nombre="Página no encontrada" />} />
        </Route>
      </Route>
    </Routes>
  )
}
