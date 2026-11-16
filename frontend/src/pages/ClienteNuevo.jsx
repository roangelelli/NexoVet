import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import FormCuenta from '../components/FormCuenta'
import { Titulo } from '../components/ui'

// Alta de un cliente por parte del personal (por ejemplo, alguien que viene a la veterinaria)
export default function ClienteNuevo() {
  const navegar = useNavigate()

  const crear = async (datos) => {
    const { cliente } = await api.post('/clientes', datos)
    navegar(`/clientes/${cliente.id}`)
  }

  return (
    <div className="max-w-lg">
      <Titulo>Nuevo cliente</Titulo>
      <div className="rounded-xl bg-white p-5">
        <FormCuenta textoBoton="Crear cliente" onEnviar={crear} />
      </div>
      <p className="mt-4"><Link to="/clientes" className="text-mar underline">Volver a clientes</Link></p>
    </div>
  )
}
