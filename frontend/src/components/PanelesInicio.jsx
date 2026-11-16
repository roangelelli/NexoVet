import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { AvatarMascota } from './Animales'
import Icono from './Icono'
import ProximosTurnos from './ProximosTurnos'
import { useToast } from '../context/ToastContext'
import TurnoRapido from './TurnoRapido'
import { Aviso, Cargando, EnlaceBoton, Estado, Modal, Vacio } from './ui'
import { diasEntre, edadTexto, etiquetaDia, fechaLegible, hoy, horaActual, sumarDias } from '../utils'

const TONOS = {
  mar: 'bg-mar/10 text-mar',
  aviso: 'bg-pomelo/25 text-aviso',
  ok: 'bg-ok/15 text-ok',
}

const SUPERFICIE = 'rounded-xl bg-white shadow-sm ring-1 ring-tinta/5'

// Tarjeta con un número grande que lleva a la pantalla donde se trabaja ese tema
function Dato({ icono, valor, etiqueta, to, tono = 'mar' }) {
  return (
    <Link to={to} className={`flex items-center gap-4 p-4 transition hover:shadow-md hover:ring-mar/30 ${SUPERFICIE}`}>
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${TONOS[tono]}`}><Icono nombre={icono} className="size-6" /></span>
      <span>
        <span className="block font-display text-4xl font-semibold leading-none">{valor}</span>
        <span className="mt-1 block text-sm text-tinta/70">{etiqueta}</span>
      </span>
    </Link>
  )
}

function Seccion({ titulo, enlace, textoEnlace, children }) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
        {enlace && <Link to={enlace} className="text-mar underline">{textoEnlace}</Link>}
      </div>
      {children}
    </section>
  )
}

const textoVencimiento = (dias) => {
  if (dias < 0) return `Venció hace ${-dias} ${dias === -1 ? 'día' : 'días'}`
  if (dias === 0) return 'Vence hoy'
  return `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`
}

// Lista de turnos del día para recepción
function AgendaDeHoy({ carga, turnos }) {
  return (
    <Seccion titulo="Agenda de hoy" enlace="/turnos?periodo=hoy" textoEnlace="Ver agenda">
      {carga.cargando && !carga.datos && <Cargando />}
      {carga.datos && turnos.length === 0 && <Vacio icono="calendario">Hoy no hay turnos.</Vacio>}
      {turnos.length > 0 && (
        <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
          {turnos.slice(0, 6).map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <span className="w-14 shrink-0 font-display text-lg font-semibold">{t.hora}</span>
              <span className="min-w-0 flex-1">
                <Link to={`/mascotas/${t.mascota_id}`} className="font-semibold text-mar underline">{t.mascota}</Link>
                <span className="block truncate text-sm text-tinta/70">{t.cliente}{t.motivo ? ` · ${t.motivo}` : ''}</span>
              </span>
              <Estado valor={t.estado} />
            </li>
          ))}
        </ul>
      )}
    </Seccion>
  )
}

// Horarios libres de hoy y de mañana: sirve para ofrecer un turno a quien llama o llega sin turno
function HorariosLibres({ onReservado }) {
  const [elegido, setElegido] = useState(null) // { fecha, hora } del horario tocado
  const { avisar } = useToast()
  const manana = sumarDias(hoy(), 1)
  const ahora = horaActual()

  const deHoy = useCarga(() => api.get(`/disponibilidad/franjas?fecha=${hoy()}`), [])
  const deManana = useCarga(() => api.get(`/disponibilidad/franjas?fecha=${manana}`), [])

  const dias = [
    ['Hoy', hoy(), deHoy, (deHoy.datos?.franjas || []).filter((f) => f.slice(0, 5) > ahora)],
    ['Mañana', manana, deManana, deManana.datos?.franjas || []],
  ]

  const reservado = (mensaje) => {
    setElegido(null)
    avisar(mensaje)
    deHoy.recargar()
    deManana.recargar()
    onReservado()
  }

  return (
    <Seccion titulo="Horarios libres" enlace="/disponibilidad" textoEnlace="Configurar horarios">
      <div className={`space-y-4 p-4 ${SUPERFICIE}`}>
        <Aviso tipo="error">{deHoy.error || deManana.error}</Aviso>
        <p className="text-sm text-tinta/70">Tocá un horario para darle un turno a un cliente.</p>
        {dias.map(([titulo, fecha, carga, franjas]) => (
          <div key={titulo} className="space-y-2">
            <h3 className="font-semibold">{titulo}</h3>
            {carga.cargando && !carga.datos && <p className="text-sm text-tinta/70">Cargando…</p>}
            {carga.datos && franjas.length === 0 && <p className="text-sm text-tinta/70">Sin horarios libres.</p>}
            {franjas.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {franjas.slice(0, 12).map((f) => (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => setElegido({ fecha, hora: f })}
                      className="min-h-10 rounded-lg bg-mar/10 px-3 font-semibold text-mar-oscuro transition-colors hover:bg-mar hover:text-white"
                    >
                      {f.slice(0, 5)}
                    </button>
                  </li>
                ))}
                {franjas.length > 12 && <li className="px-1 py-1.5 text-sm text-tinta/70">+{franjas.length - 12} más</li>}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Modal abierto={elegido !== null} titulo="Dar turno" onCerrar={() => setElegido(null)}>
        {elegido && <TurnoRapido fecha={elegido.fecha} hora={elegido.hora} onListo={reservado} onCancelar={() => setElegido(null)} />}
      </Modal>
    </Seccion>
  )
}

// Vacunas que vencen en la próxima semana: pacientes a los que conviene ofrecerles la revacunación
function VacunasPorVencer({ carga, lista }) {
  return (
  <Seccion titulo="Vacunas por vencer" enlace="/reportes?pestana=por_vencer" textoEnlace="Ver reporte">
    {carga.cargando && !carga.datos && <Cargando />}
    {carga.datos && lista.length === 0 && <Vacio icono="vacuna">Ninguna vacuna vence en los próximos 7 días.</Vacio>}
    {lista.length > 0 && (
      <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
        {lista.slice(0, 6).map((v) => (
          <li key={v.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pomelo/25 text-aviso"><Icono nombre="vacuna" /></span>
            <span className="min-w-0 flex-1">
              <Link to={`/mascotas/${v.mascota_id}`} className="font-semibold text-mar underline">{v.mascota}</Link>
              <span className="block truncate text-sm text-tinta/70">{v.tipo}</span>
            </span>
            <span className="shrink-0 text-sm text-aviso">{textoVencimiento(diasEntre(hoy(), v.proxima_fecha))}</span>
          </li>
        ))}
      </ul>
    )}
  </Seccion>
  )
}

// Resumen para el personal: números del día y paneles de trabajo según el rol
export function PanelPersonal({ esRecepcion }) {
  const turnosHoy = useCarga(() => api.get(`/reportes/turnos-del-dia?fecha=${hoy()}`), [])
  const turnos = useCarga(() => (esRecepcion ? api.get('/turnos') : Promise.resolve(null)), [esRecepcion])
  const vacunas = useCarga(() => api.get('/reportes/vacunas-por-vencer?dias=30'), [])

  const deHoy = (turnosHoy.datos?.turnos || []).filter((t) => t.estado !== 'cancelado')
  const todos = turnos.datos?.turnos || []
  const pendientes = todos.filter((t) => t.estado === 'solicitado' && t.fecha >= hoy())
  const lista = vacunas.datos?.vacunas || []
  const vencidas = lista.filter((v) => v.estado === 'vencida')
  const porVencer = lista.filter((v) => v.estado !== 'vencida' && diasEntre(hoy(), v.proxima_fecha) <= 7)

  return (
    <div className="space-y-8">
      <Aviso tipo="error">{turnosHoy.error || turnos.error || vacunas.error}</Aviso>

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${esRecepcion ? 'lg:grid-cols-3' : ''}`}>
        <Dato icono="calendario" valor={turnosHoy.datos ? deHoy.length : '—'} etiqueta="Turnos para hoy" to="/turnos?periodo=hoy" />
        {esRecepcion && (
          <Dato icono="reloj" tono="aviso" valor={turnos.datos ? pendientes.length : '—'} etiqueta="Solicitudes por confirmar" to="/turnos?periodo=todas&estado=solicitado" />
        )}
        <Dato icono="vacuna" tono="aviso" valor={vacunas.datos ? vencidas.length : '—'} etiqueta="Vacunas vencidas" to="/reportes?pestana=vencidas" />
      </div>

      {!esRecepcion && (
        <>
          <ProximosTurnos />
          <VacunasPorVencer carga={vacunas} lista={porVencer} />
        </>
      )}

      {esRecepcion && (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AgendaDeHoy carga={turnosHoy} turnos={deHoy} />

        <Seccion titulo="Solicitudes por confirmar" enlace="/turnos?periodo=todas&estado=solicitado" textoEnlace="Ir a la agenda">
            {turnos.cargando && !turnos.datos && <Cargando />}
            {turnos.datos && pendientes.length === 0 && <Vacio icono="ok">No hay solicitudes pendientes.</Vacio>}
            {pendientes.length > 0 && (
              <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
                {pendientes.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-24 shrink-0">
                      <span className="block font-semibold">{etiquetaDia(t.fecha)}</span>
                      <span className="block text-sm text-tinta/70">{t.hora} hs</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.mascota}</span>
                      <span className="block truncate text-sm text-tinta/70">{t.cliente}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </Seccion>
      </div>
      )}

      {esRecepcion && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <HorariosLibres onReservado={() => { turnosHoy.recargar(); turnos.recargar() }} />

          <Seccion titulo="Vacunas vencidas: avisar a los clientes" enlace="/reportes?pestana=vencidas" textoEnlace="Ver todas">
            {vacunas.cargando && !vacunas.datos && <Cargando />}
            {vacunas.datos && vencidas.length === 0 && <Vacio icono="ok">No hay vacunas vencidas.</Vacio>}
            {vencidas.length > 0 && (
              <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
                {vencidas.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1">
                      <Link to={`/mascotas/${v.mascota_id}`} className="font-semibold text-mar underline">{v.mascota}</Link>
                      <span className="block truncate text-sm text-tinta/70">{v.tipo} · {textoVencimiento(diasEntre(hoy(), v.proxima_fecha))}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm">
                      <Link to={`/clientes/${v.cliente_id}`} className="block text-mar underline">{v.cliente}</Link>
                      <span className="inline-flex items-center gap-1 text-tinta/70"><Icono nombre="telefono" className="size-3.5" />{v.telefono || 'Sin teléfono'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>
        </div>
      )}
    </div>
  )
}

const ORDEN_VACUNA = { vencida: 0, por_vencer: 1, vigente: 2 }

// Panel del cliente: sus próximos turnos, sus mascotas y el estado de sus vacunas
export function PanelCliente() {
  const turnos = useCarga(() => api.get('/turnos'), [])
  const mascotas = useCarga(() => api.get('/mascotas'), [])
  const lista = mascotas.datos?.mascotas
  const vacunas = useCarga(
    () => (lista && lista.length > 0
      ? Promise.all(lista.map((m) => api.get(`/vacunas?mascota_id=${m.id}`).then((d) => d.vacunas.map((v) => ({ ...v, mascota_id: m.id, mascota: m.nombre, especie: m.especie })))))
        .then((grupos) => grupos.flat())
      : Promise.resolve(null)),
    [mascotas.datos],
  )

  const proximos = (turnos.datos?.turnos || []).filter((t) => ['solicitado', 'confirmado'].includes(t.estado) && t.fecha >= hoy()).slice(0, 3)
  const delCarnet = (vacunas.datos || [])
    .filter((v) => v.estado !== 'anterior')
    .sort((a, b) => ORDEN_VACUNA[a.estado] - ORDEN_VACUNA[b.estado] || String(a.proxima_fecha).localeCompare(String(b.proxima_fecha)))

  return (
    <div className="space-y-8">
      <Aviso tipo="error">{turnos.error || mascotas.error || vacunas.error}</Aviso>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Seccion titulo="Próximos turnos" enlace="/turnos" textoEnlace="Ver todos">
          {turnos.cargando && <Cargando />}
          {turnos.datos && proximos.length === 0 && (
            <div className="space-y-3">
              <Vacio icono="calendario">No tenés turnos próximos.</Vacio>
              <EnlaceBoton to="/turnos/nuevo" icono="mas">Pedir turno</EnlaceBoton>
            </div>
          )}
          {proximos.length > 0 && (
            <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
              {proximos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mar/10 text-mar"><Icono nombre="calendario" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{etiquetaDia(t.fecha)} · {t.hora} hs</span>
                    <span className="block truncate text-sm text-tinta/70">{t.mascota}{t.motivo ? ` · ${t.motivo}` : ''}</span>
                  </span>
                  <Estado valor={t.estado} />
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Mis mascotas" enlace="/mascotas" textoEnlace="Ver todas">
          {mascotas.cargando && <Cargando />}
          {lista && lista.length === 0 && (
            <div className="space-y-3">
              <Vacio icono="huella">Todavía no cargaste ninguna mascota.</Vacio>
              <EnlaceBoton to="/mascotas/nueva" icono="mas">Agregar mascota</EnlaceBoton>
            </div>
          )}
          {lista && lista.length > 0 && (
            <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
              {lista.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <Link to={`/mascotas/${m.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-arena/60">
                    <AvatarMascota especie={m.especie} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{m.nombre}</span>
                      <span className="block truncate text-sm text-tinta/70">
                        {m.especie === 'Otro' ? m.especie_otra : m.especie}{m.raza ? ` · ${m.raza}` : ''} · {edadTexto(m.fecha_nacimiento)}
                      </span>
                    </span>
                    <Icono nombre="derecha" className="size-5 text-tinta/40" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      {lista && lista.length > 0 && (
        <Seccion titulo="Vacunas de mis mascotas">
          {vacunas.cargando && !vacunas.datos && <Cargando />}
          {vacunas.datos && delCarnet.length === 0 && <Vacio icono="vacuna">Todavía no hay vacunas registradas.</Vacio>}
          {delCarnet.length > 0 && (
            <ul className={`divide-y divide-arena ${SUPERFICIE}`}>
              {delCarnet.slice(0, 6).map((v) => (
                <li key={v.id}>
                  <Link to={`/mascotas/${v.mascota_id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-arena/60">
                    <AvatarMascota especie={v.especie} tamano="size-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{v.mascota} · {v.tipo}</span>
                      <span className="block text-sm text-tinta/70">{v.proxima_fecha ? `Próxima dosis: ${fechaLegible(v.proxima_fecha)}` : 'Dosis única'}</span>
                    </span>
                    <Estado valor={v.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      )}
    </div>
  )
}
