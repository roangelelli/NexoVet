import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import { EnConstruccion } from './components/ui'
import ClienteFicha from './pages/ClienteFicha'
import ClienteNuevo from './pages/ClienteNuevo'
import Clientes from './pages/Clientes'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import MascotaFicha from './pages/MascotaFicha'
import MascotaForm from './pages/MascotaForm'
import MisMascotas from './pages/MisMascotas'
import Registro from './pages/Registro'

const PERSONAL = ['recepcion', 'veterinario']

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Todo lo de adentro exige sesión */}
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/turnos" element={<EnConstruccion nombre="Turnos" />} />
          <Route path="/mascotas/:id" element={<MascotaFicha />} />
          <Route path="/mascotas/:id/editar" element={<MascotaForm />} />

          <Route element={<RutaProtegida roles={['cliente']} />}>
            <Route path="/mascotas" element={<MisMascotas />} />
            <Route path="/mascotas/nueva" element={<MascotaForm />} />
            <Route path="/perfil" element={<ClienteFicha propio />} />
          </Route>

          <Route element={<RutaProtegida roles={PERSONAL} />}>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteNuevo />} />
            <Route path="/clientes/:id" element={<ClienteFicha />} />
            <Route path="/clientes/:clienteId/mascotas/nueva" element={<MascotaForm />} />
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
