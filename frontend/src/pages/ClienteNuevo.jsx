import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import FormCuenta from '../components/FormCuenta'
import { useToast } from '../context/ToastContext'
import { DosColumnas, PanelAyuda, Titulo } from '../components/ui'

const PASOS = [
  ['usuario', 'Datos de acceso', 'El cliente ingresa con su email y la contraseña que cargues acá.'],
  ['huella', 'Después, sus mascotas', 'Al crear el cliente se abre su ficha, donde podés agregarle mascotas.'],
  ['calendario', 'Y sus turnos', 'Con una mascota cargada ya podés darle turnos desde su ficha.'],
]

// Alta de un cliente por parte del personal (por ejemplo, alguien que viene a la veterinaria)
export default function ClienteNuevo() {
  const navegar = useNavigate()
  const { avisar } = useToast()

  const crear = async (datos) => {
    const { cliente } = await api.post('/clientes', datos)
    avisar(`Cliente ${cliente.nombre} ${cliente.apellido} creado.`)
    navegar(`/clientes/${cliente.id}`)
  }

  return (
    <div>
      <Titulo>Nuevo cliente</Titulo>
      <DosColumnas lateral={<PanelAyuda titulo="Qué pasa después" pasos={PASOS} />}>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
          <FormCuenta textoBoton="Crear cliente" onEnviar={crear} />
        </div>
        <p className="mt-4"><Link to="/clientes" className="text-mar underline">Volver a clientes</Link></p>
      </DosColumnas>
    </div>
  )
}
