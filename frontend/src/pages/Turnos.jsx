import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, BotonConfirmar, Cargando, EnlaceBoton, Estado, Select, Titulo, Vacio } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { fechaLegible, hoy, lunesDe, sumarDias } from '../utils'

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function diaYFecha(fecha) {
  const dia = DIAS_CORTOS[new Date(fecha + 'T12:00:00').getDay()]
  return `${dia} ${fechaLegible(fecha)}`
}

// Misma ruta para todos: el cliente ve sus turnos y el personal ve la agenda
export default function Turnos() {
  const { usuario } = useAuth()
  const { search } = useLocation()
  // Con key = la consulta de la URL, tocar "Turnos" en el menú vuelve a los filtros por defecto
  return usuario.rol === 'cliente' ? <MisTurnos /> : <Agenda key={search} />
}

function MisTurnos() {
  const { avisar } = useToast()
  const { datos, cargando, error, recargar } = useCarga(() => api.get('/turnos'), [])
  const [errorAccion, setErrorAccion] = useState('')

  const cancelar = async (id) => {
    setErrorAccion('')
    try {
      await api.patch(`/turnos/${id}/cancelar`)
      avisar('Turno cancelado.')
      recargar()
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  const proximos = datos?.turnos.filter((t) => ['solicitado', 'confirmado'].includes(t.estado)) || []
  const anteriores = datos?.turnos.filter((t) => !['solicitado', 'confirmado'].includes(t.estado)).reverse() || []

  return (
    <div className="space-y-8">
      <Titulo accion={<EnlaceBoton to="/turnos/nuevo">Pedir turno</EnlaceBoton>}>Mis turnos</Titulo>
      <Aviso tipo="error">{error || errorAccion}</Aviso>
      {cargando && <Cargando />}

      {datos && (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold">Próximos</h2>
            {proximos.length === 0 && <Vacio>No tenés turnos próximos. Tocá "Pedir turno" para reservar uno.</Vacio>}
            {proximos.length > 0 && (
              <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
                {proximos.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-display text-xl font-semibold">{diaYFecha(t.fecha)} · {t.hora} hs</p>
                      <p className="text-tinta/70">{t.mascota}{t.motivo ? ` · ${t.motivo}` : ''}</p>
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                      <Estado valor={t.estado} />
                      <BotonConfirmar texto="Cancelar turno" textoConfirmar="Sí, cancelar" onConfirmar={() => cancelar(t.id)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {anteriores.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold">Anteriores</h2>
              <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
                {anteriores.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <span>{diaYFecha(t.fecha)} · {t.hora} hs · {t.mascota}</span>
                    <Estado valor={t.estado} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

const PERIODOS = [
  ['hoy', 'Hoy'],
  ['dia', 'Un día'],
  ['semana', 'Esta semana'],
  ['proxima', 'Semana siguiente'],
  ['todas', 'Todas las fechas'],
]
const ESTADOS = [
  ['', 'Todos los estados'],
  ['solicitado', 'Pendientes de confirmar'],
  ['confirmado', 'Confirmados'],
  ['atendido', 'Atendidos'],
  ['cancelado', 'Cancelados'],
]

function Agenda() {
  const { usuario } = useAuth()
  const { avisar } = useToast()
  const esVeterinario = usuario.rol === 'veterinario'
  // Se puede llegar con filtros desde el inicio: /turnos?periodo=todas&estado=solicitado
  const [paramsUrl] = useSearchParams()
  const periodoUrl = paramsUrl.get('periodo')
  const estadoUrl = paramsUrl.get('estado')
  const [periodo, setPeriodo] = useState(PERIODOS.some(([v]) => v === periodoUrl) ? periodoUrl : 'hoy')
  const [dia, setDia] = useState(hoy())
  const [estado, setEstado] = useState(ESTADOS.some(([v]) => v === estadoUrl) ? estadoUrl : '')
  const [errorAccion, setErrorAccion] = useState('')

  // Hoy y "un día" se filtran en el servidor; las semanas se recortan acá
  const fechaExacta = periodo === 'hoy' ? hoy() : periodo === 'dia' ? dia : null
  const params = new URLSearchParams()
  if (fechaExacta) params.set('fecha', fechaExacta)
  if (estado) params.set('estado', estado)
  const consulta = params.toString() ? `?${params}` : ''
  const { datos, cargando, error, recargar } = useCarga(() => api.get(`/turnos${consulta}`), [consulta])

  let turnos = datos?.turnos || []
  if (periodo === 'semana' || periodo === 'proxima') {
    const desde = periodo === 'semana' ? lunesDe(hoy()) : sumarDias(lunesDe(hoy()), 7)
    const hasta = sumarDias(desde, 6)
    turnos = turnos.filter((t) => t.fecha >= desde && t.fecha <= hasta)
  }

  const cambiar = async (id, accion) => {
    setErrorAccion('')
    try {
      await api.patch(`/turnos/${id}/${accion}`)
      avisar({ confirmar: 'Turno confirmado.', atender: 'Turno marcado como atendido.', cancelar: 'Turno cancelado.' }[accion])
      recargar()
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  return (
    <div>
      <Titulo>Agenda de turnos</Titulo>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select id="periodo" etiqueta="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          {PERIODOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Select>
        {periodo === 'dia' && (
          <div>
            <label htmlFor="dia" className="mb-1 block text-sm font-medium">Día</label>
            <input id="dia" type="date" required className="min-h-11 rounded-lg border border-arena bg-white px-3" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} />
          </div>
        )}
        <Select id="estado" etiqueta="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </Select>
      </div>

      <Aviso tipo="error">{error || errorAccion}</Aviso>
      {cargando && <Cargando />}

      {datos && turnos.length === 0 && <Vacio>No hay turnos con estos filtros.</Vacio>}

      {datos && turnos.length > 0 && (
        <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
          {turnos.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-display text-xl font-semibold">
                  {fechaExacta ? '' : `${diaYFecha(t.fecha)} · `}{t.hora} hs
                </p>
                <p>
                  <Link to={`/mascotas/${t.mascota_id}`} className="font-semibold text-mar underline">{t.mascota}</Link>
                  <span className="text-tinta/70"> · {t.cliente}</span>
                </p>
                {t.motivo && <p className="text-tinta/70">{t.motivo}</p>}
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>button]:flex-1 [&>a]:flex-1 sm:[&>button]:flex-none sm:[&>a]:flex-none">
                <Estado valor={t.estado} />
                {t.estado === 'solicitado' && <Boton type="button" onClick={() => cambiar(t.id, 'confirmar')}>Confirmar</Boton>}
                {t.estado === 'confirmado' && esVeterinario && (
                  <EnlaceBoton to={`/mascotas/${t.mascota_id}/atenciones/nueva?turno=${t.id}`}>Registrar atención</EnlaceBoton>
                )}
                {t.estado === 'confirmado' && !esVeterinario && (
                  <Boton type="button" variante="secundario" onClick={() => cambiar(t.id, 'atender')}>Marcar atendido</Boton>
                )}
                {['solicitado', 'confirmado'].includes(t.estado) && (
                  <BotonConfirmar texto="Cancelar" textoConfirmar="Sí, cancelar" onConfirmar={() => cambiar(t.id, 'cancelar')} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
