import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Cargando, EnlaceBoton, Vacio } from './ui'
import { fechaLegible, hoy } from '../utils'

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

// Panel del veterinario en el inicio: los próximos turnos confirmados, listos para atender
export default function ProximosTurnos() {
  const { datos, cargando, error } = useCarga(() => api.get('/turnos?estado=confirmado'), [])
  const proximos = (datos?.turnos || []).filter((t) => t.fecha >= hoy()).slice(0, 6)

  return (
    <section className="mt-8 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold">Próximos turnos</h2>
        <Link to="/turnos" className="text-mar underline">Ver agenda completa</Link>
      </div>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && proximos.length === 0 && <Vacio>No hay turnos confirmados próximos.</Vacio>}

      {proximos.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proximos.map((t) => (
            <li key={t.id} className="flex flex-col gap-2 rounded-xl bg-white p-4">
              <p className="font-display text-lg font-semibold">
                {t.fecha === hoy() ? 'Hoy' : `${DIAS_CORTOS[new Date(t.fecha + 'T12:00:00').getDay()]} ${fechaLegible(t.fecha).slice(0, 5)}`} · {t.hora} hs
              </p>
              <p>
                <Link to={`/mascotas/${t.mascota_id}`} className="font-semibold text-mar underline">{t.mascota}</Link>
                <span className="block text-tinta/70">{t.cliente}</span>
                {t.motivo && <span className="block text-tinta/70">{t.motivo}</span>}
              </p>
              <EnlaceBoton to={`/mascotas/${t.mascota_id}/atenciones/nueva?turno=${t.id}`} className="mt-auto">Registrar atención</EnlaceBoton>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
