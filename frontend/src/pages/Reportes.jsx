import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Celda, Cargando, Estado, Fila, Pestanas, Select, Tabla, Titulo, Vacio } from '../components/ui'
import { diasEntre, fechaLegible, hoy, lunesDe, rangoMes, sumarDias } from '../utils'

const PESTANAS = [
  ['dia', 'Turnos del día'],
  ['resumen', 'Resumen de turnos'],
  ['vencidas', 'Vacunas vencidas'],
  ['por_vencer', 'Vacunas por vencer'],
]

export default function Reportes() {
  const { search } = useLocation()
  return <ReportesConPestanas key={search} />
}

// Se puede llegar a una pestaña desde el inicio: /reportes?pestana=vencidas
function ReportesConPestanas() {
  const [params] = useSearchParams()
  const pestanaUrl = params.get('pestana')
  const [pestana, setPestana] = useState(PESTANAS.some(([v]) => v === pestanaUrl) ? pestanaUrl : 'dia')

  return (
    <div>
      <Titulo>Reportes</Titulo>
      <Pestanas opciones={PESTANAS} valor={pestana} onCambiar={setPestana} />
      {pestana === 'dia' && <TurnosDelDia />}
      {pestana === 'resumen' && <ResumenTurnos />}
      {pestana === 'vencidas' && <VacunasVencidas />}
      {pestana === 'por_vencer' && <VacunasPorVencer />}
    </div>
  )
}

const ESTADOS = ['solicitado', 'confirmado', 'atendido', 'cancelado']
const COLOR_BARRA = { solicitado: 'bg-pomelo', confirmado: 'bg-mar', atendido: 'bg-ok', cancelado: 'bg-tinta/30' }

function TurnosDelDia() {
  const [fecha, setFecha] = useState(hoy())
  const { datos, cargando, error } = useCarga(() => api.get(`/reportes/turnos-del-dia?fecha=${fecha}`), [fecha])

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fecha" className="mb-1 block text-sm font-medium">Día</label>
        <input id="fecha" type="date" required className="min-h-11 rounded-lg border border-arena bg-white px-3" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} />
      </div>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}

      {datos && (
        <>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-display text-xl font-semibold">{datos.total} {datos.total === 1 ? 'turno' : 'turnos'}</span>
            {ESTADOS.filter((e) => datos.por_estado[e] > 0).map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5"><Estado valor={e} /> {datos.por_estado[e]}</span>
            ))}
          </p>

          {datos.turnos.length === 0 && <Vacio>No hay turnos para el {fechaLegible(fecha)}.</Vacio>}
          {datos.turnos.length > 0 && (
            <Tabla columnas={['Hora', 'Mascota', 'Cliente', 'Motivo', 'Estado']}>
              {datos.turnos.map((t) => (
                <Fila key={t.id}>
                  <Celda className="font-semibold">{t.hora} hs</Celda>
                  <Celda etiqueta="Mascota"><Link to={`/mascotas/${t.mascota_id}`} className="font-semibold text-mar underline">{t.mascota}</Link></Celda>
                  <Celda etiqueta="Cliente">{t.cliente}</Celda>
                  <Celda etiqueta="Motivo">{t.motivo || '—'}</Celda>
                  <Celda etiqueta="Estado"><Estado valor={t.estado} /></Celda>
                </Fila>
              ))}
            </Tabla>
          )}
        </>
      )}
    </div>
  )
}

// Cuenta los turnos de un período por estado. No usa un endpoint propio: se arma con la lista de turnos.
const PERIODOS = [
  ['semana', 'Esta semana'],
  ['proxima', 'Semana siguiente'],
  ['mes', 'Este mes'],
  ['anterior', 'Mes anterior'],
]

function rangoDe(periodo) {
  const lunes = lunesDe(hoy())
  if (periodo === 'semana') return [lunes, sumarDias(lunes, 6)]
  if (periodo === 'proxima') return [sumarDias(lunes, 7), sumarDias(lunes, 13)]
  if (periodo === 'mes') return rangoMes(0)
  return rangoMes(-1)
}

function ResumenTurnos() {
  const [periodo, setPeriodo] = useState('semana')
  const { datos, cargando, error } = useCarga(() => api.get('/turnos'), [])

  const [desde, hasta] = rangoDe(periodo)
  const turnos = (datos?.turnos || []).filter((t) => t.fecha >= desde && t.fecha <= hasta)
  const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, turnos.filter((t) => t.estado === e).length]))
  const porcentaje = (n) => (turnos.length ? Math.round((n / turnos.length) * 100) : 0)

  return (
    <div className="space-y-4">
      <Select id="periodo" etiqueta="Período" className="w-56" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
        {PERIODOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
      </Select>
      <p className="text-tinta/70">Del {fechaLegible(desde)} al {fechaLegible(hasta)}.</p>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}

      {datos && turnos.length === 0 && <Vacio>No hay turnos en este período.</Vacio>}
      {datos && turnos.length > 0 && (
        <div className="space-y-4">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESTADOS.map((e) => (
              <li key={e} className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-tinta/5">
                <Estado valor={e} />
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold leading-none">{cuenta[e]}</span>
                  <span className="text-tinta/70">{porcentaje(cuenta[e])}%</span>
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-arena" aria-hidden="true">
                  <div className={`h-full rounded-full ${COLOR_BARRA[e]}`} style={{ width: `${porcentaje(cuenta[e])}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="font-display text-xl font-semibold">Total: {turnos.length} {turnos.length === 1 ? 'turno' : 'turnos'}</p>
        </div>
      )}
    </div>
  )
}

// El backend entrega, para cada mascota y vacuna, la última aplicación cuya próxima fecha cae antes del límite
function TablaVacunas({ vacunas, vacio, textoVencimiento }) {
  if (vacunas.length === 0) return <Vacio>{vacio}</Vacio>
  return (
    <Tabla columnas={['Mascota', 'Cliente', 'Vacuna', 'Vencimiento']}>
      {vacunas.map((v) => (
        <Fila key={v.id}>
          <Celda><Link to={`/mascotas/${v.mascota_id}`} className="font-semibold text-mar underline">{v.mascota}</Link></Celda>
          <Celda etiqueta="Cliente">
            <Link to={`/clientes/${v.cliente_id}`} className="text-mar underline">{v.cliente}</Link>
            <span className="block text-sm text-tinta/70">{v.telefono || 'Sin teléfono'}</span>
          </Celda>
          <Celda etiqueta="Vacuna">{v.tipo}<span className="block text-sm text-tinta/70">Aplicada el {fechaLegible(v.fecha_aplicacion)}</span></Celda>
          <Celda etiqueta="Vencimiento">{fechaLegible(v.proxima_fecha)}<span className="block text-sm text-tinta/70">{textoVencimiento(diasEntre(hoy(), v.proxima_fecha))}</span></Celda>
        </Fila>
      ))}
    </Tabla>
  )
}

function VacunasVencidas() {
  const { datos, cargando, error } = useCarga(() => api.get('/reportes/vacunas-por-vencer?dias=0'), [])
  const vencidas = (datos?.vacunas || []).filter((v) => v.estado === 'vencida')

  const texto = (dias) => `Venció hace ${-dias} ${dias === -1 ? 'día' : 'días'}`

  return (
    <div className="space-y-4">
      <p className="text-tinta/70">Mascotas con una vacuna cuya revacunación ya pasó. Sirve para avisarle al cliente.</p>
      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && <TablaVacunas vacunas={vencidas} vacio="No hay vacunas vencidas." textoVencimiento={texto} />}
    </div>
  )
}

function VacunasPorVencer() {
  const [dias, setDias] = useState('30')
  const { datos, cargando, error } = useCarga(() => api.get(`/reportes/vacunas-por-vencer?dias=${dias}`), [dias])
  const proximas = (datos?.vacunas || []).filter((v) => v.estado !== 'vencida')

  const texto = (d) => (d === 0 ? 'Vence hoy' : `Vence en ${d} ${d === 1 ? 'día' : 'días'}`)

  return (
    <div className="space-y-4">
      <Select id="dias" etiqueta="Vencen en los próximos" className="w-56" value={dias} onChange={(e) => setDias(e.target.value)}>
        {[7, 15, 30, 60, 90].map((d) => <option key={d} value={d}>{d} días</option>)}
      </Select>
      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && <TablaVacunas vacunas={proximas} vacio={`No hay vacunas que venzan en los próximos ${dias} días.`} textoVencimiento={texto} />}
    </div>
  )
}
