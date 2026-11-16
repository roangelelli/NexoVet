import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import AtencionDetalle from './pages/AtencionDetalle'
import AtencionForm from './pages/AtencionForm'
import ClienteFicha from './pages/ClienteFicha'
import ClienteNuevo from './pages/ClienteNuevo'
import Clientes from './pages/Clientes'
import Disponibilidad from './pages/Disponibilidad'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import MascotaFicha from './pages/MascotaFicha'
import MascotaForm from './pages/MascotaForm'
import NoEncontrada from './pages/NoEncontrada'
import Mascotas from './pages/Mascotas'
import Registro from './pages/Registro'
import Reportes from './pages/Reportes'
import TurnoNuevo from './pages/TurnoNuevo'
import Turnos from './pages/Turnos'

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
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/turnos/nuevo" element={<TurnoNuevo />} />
          <Route path="/atenciones/:id" element={<AtencionDetalle />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/mascotas/nueva" element={<MascotaForm />} />
          <Route path="/mascotas/:id" element={<MascotaFicha />} />
          <Route path="/mascotas/:id/editar" element={<MascotaForm />} />

          <Route element={<RutaProtegida roles={['cliente']} />}>
            <Route path="/perfil" element={<ClienteFicha propio />} />
          </Route>

          <Route element={<RutaProtegida roles={PERSONAL} />}>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteNuevo />} />
            <Route path="/clientes/:id" element={<ClienteFicha />} />
            <Route path="/clientes/:clienteId/mascotas/nueva" element={<MascotaForm />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>

          <Route element={<RutaProtegida roles={['veterinario']} />}>
            <Route path="/mascotas/:mascotaId/atenciones/nueva" element={<AtencionForm />} />
            <Route path="/atenciones/:id/editar" element={<AtencionForm />} />
          </Route>

          <Route element={<RutaProtegida roles={['recepcion']} />}>
            <Route path="/disponibilidad" element={<Disponibilidad />} />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Route>
    </Routes>
  )
}
