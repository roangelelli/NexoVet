import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icono from './Icono'

// Componentes chicos y reutilizables. Todas las pantallas arman sus formularios con estos.

const estilosBoton = {
  principal: 'bg-mar text-white hover:bg-mar-oscuro',
  secundario: 'bg-white text-tinta border border-arena hover:bg-arena',
  peligro: 'bg-error text-white hover:opacity-90',
  claro: 'bg-white text-mar-oscuro hover:bg-bruma',
  fantasma: 'border border-white/40 text-white hover:bg-white/10',
}

export function Boton({ variante = 'principal', cargando = false, icono, className = '', children, ...resto }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${estilosBoton[variante]} ${className}`}
      disabled={cargando || resto.disabled}
      {...resto}
    >
      {!cargando && icono && <Icono nombre={icono} />}
      {cargando ? 'Un momento…' : children}
    </button>
  )
}

export function Campo({ etiqueta, id, error, ayuda, icono, type, className = '', onKeyDown, onKeyUp, onBlur, ...resto }) {
  const [mayusculas, setMayusculas] = useState(false)
  const [visible, setVisible] = useState(false)
  const esClave = type === 'password'
  const detectar = (e) => {
    if (esClave && e.getModifierState) setMayusculas(e.getModifierState('CapsLock'))
  }
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{etiqueta}</label>
      <div className="relative">
        {icono && <Icono nombre={icono} className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-tinta/50" />}
        <input
          id={id}
          type={esClave && visible ? 'text' : type}
          className={`min-h-11 w-full rounded-lg border border-arena bg-white px-3 text-base transition-colors hover:border-mar/40 focus:border-mar ${icono ? 'pl-10' : ''} ${esClave ? 'pr-12' : ''}`}
          aria-invalid={Boolean(error)}
          onKeyDown={(e) => { detectar(e); onKeyDown?.(e) }}
          onKeyUp={(e) => { detectar(e); onKeyUp?.(e) }}
          onBlur={(e) => { setMayusculas(false); onBlur?.(e) }}
          {...resto}
        />
        {esClave && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-tinta/60 hover:bg-arena"
          >
            <Icono nombre={visible ? 'ojo-tachado' : 'ojo'} />
          </button>
        )}
      </div>
      {esClave && mayusculas && (
        <p role="status" className="mt-1 flex items-center gap-1.5 text-sm font-medium text-aviso">
          <Icono nombre="alerta" className="size-4" /> Tenés las mayúsculas activadas.
        </p>
      )}
      {ayuda && !error && <p className="mt-1 text-sm text-tinta/70">{ayuda}</p>}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}

const estilosAviso = {
  error: 'border-error/40 bg-error/10 text-error',
  ok: 'border-ok/40 bg-ok/10 text-ok',
  info: 'border-mar/30 bg-mar/10 text-mar-oscuro',
}

export function Aviso({ tipo = 'info', children }) {
  if (!children) return null
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${estilosAviso[tipo]}`}>
      {children}
    </div>
  )
}

// Etiqueta de estado: sirve para turnos (solicitado, confirmado…) y vacunas (vigente, vencida…)
const coloresEstado = {
  solicitado: 'bg-pomelo/25 text-aviso',
  confirmado: 'bg-mar/15 text-mar-oscuro',
  atendido: 'bg-ok/15 text-ok',
  cancelado: 'bg-arena text-tinta/70',
  vigente: 'bg-ok/15 text-ok',
  por_vencer: 'bg-pomelo/25 text-aviso',
  vencida: 'bg-error/15 text-error',
  anterior: 'bg-arena text-tinta/70',
}

const etiquetaEstado = (valor) => {
  const texto = String(valor).replace('_', ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const iconoEstado = {
  solicitado: 'reloj',
  confirmado: 'calendario-ok',
  atendido: 'ok',
  cancelado: 'cerrar',
  vigente: 'ok',
  por_vencer: 'alerta',
  vencida: 'alerta',
  anterior: 'reloj',
}

export function Estado({ valor }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${coloresEstado[valor] || 'bg-arena'}`}>
      {iconoEstado[valor] && <Icono nombre={iconoEstado[valor]} className="size-3.5" />}
      {etiquetaEstado(valor)}
    </span>
  )
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <p className="flex items-center justify-center gap-3 py-8 text-tinta/70" role="status">
      <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-arena border-t-mar" />
      {texto}
    </p>
  )
}

export function Titulo({ children, accion }) {
  const texto = [].concat(children).filter((c) => typeof c === 'string' || typeof c === 'number').join('').trim()
  useEffect(() => {
    document.title = texto ? `${texto} · NexoVet` : 'NexoVet'
  }, [texto])

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{children}</h1>
      {accion && <div className="w-full sm:w-auto [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">{accion}</div>}
    </div>
  )
}

export function EnConstruccion({ nombre }) {
  return (
    <div>
      <Titulo>{nombre}</Titulo>
      <Aviso tipo="info">Esta pantalla se construye en una de las próximas etapas.</Aviso>
    </div>
  )
}

export function Select({ etiqueta, id, className = '', children, ...resto }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{etiqueta}</label>
      <select id={id} className="min-h-11 w-full rounded-lg border border-arena bg-white px-3 text-base" {...resto}>
        {children}
      </select>
    </div>
  )
}

export function Casilla({ etiqueta, id, className = '', ...resto }) {
  return (
    <label htmlFor={id} className={`flex min-h-11 items-center gap-2 ${className}`}>
      <input id={id} type="checkbox" className="size-5 accent-mar" {...resto} />
      <span>{etiqueta}</span>
    </label>
  )
}

// Pantalla o lista sin datos: dice qué pasó y qué hacer
export function Vacio({ icono = 'huella', children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-arena bg-white px-4 py-8 text-center text-tinta/70">
      <span className="grid size-12 place-items-center rounded-full bg-arena text-mar"><Icono nombre={icono} className="size-6" /></span>
      <p>{children}</p>
    </div>
  )
}

// Dar de baja en dos pasos, sin ventanas emergentes: primero "Dar de baja", después "Sí, dar de baja"
export function BotonConfirmar({ texto, textoConfirmar, onConfirmar, cargando }) {
  const [confirmando, setConfirmando] = useState(false)

  if (!confirmando) {
    return <Boton variante="secundario" type="button" onClick={() => setConfirmando(true)}>{texto}</Boton>
  }
  return (
    <span className="inline-flex flex-wrap gap-2">
      <Boton variante="peligro" type="button" cargando={cargando} onClick={onConfirmar}>{textoConfirmar}</Boton>
      <Boton variante="secundario" type="button" onClick={() => setConfirmando(false)}>Cancelar</Boton>
    </span>
  )
}

export function AreaTexto({ etiqueta, id, className = '', ...resto }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{etiqueta}</label>
      <textarea id={id} rows={3} className="w-full rounded-lg border border-arena bg-white px-3 py-2 text-base" {...resto} />
    </div>
  )
}

// Enlace con aspecto de botón (para ir a otra pantalla)
export function EnlaceBoton({ to, variante = 'principal', icono, className = '', children }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-semibold transition-colors ${estilosBoton[variante]} ${className}`}
    >
      {icono && <Icono nombre={icono} />}
      {children}
    </Link>
  )
}

// Ventana flotante (usa <dialog>: se cierra con Esc y el foco queda adentro).
// El contenido se arma recién al abrir, así los formularios empiezan vacíos cada vez.
export function Modal({ abierto, titulo, onCerrar, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialogo = ref.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog ref={ref} onClose={onCerrar} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 backdrop:bg-tinta/50">
      {abierto && (
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
            <Boton type="button" variante="secundario" onClick={onCerrar}>Cerrar</Boton>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

// Selector de imágenes con un botón visible, en vez del control nativo del navegador.
// "archivos" es la lista elegida; "claveInput" se cambia para vaciar la selección.
export function SelectorImagenes({ id, etiqueta, multiple = false, archivos, onChange, claveInput }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{etiqueta}</span>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-mar px-4 font-semibold text-mar hover:bg-mar/10 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pomelo">
          {multiple ? 'Elegir imágenes' : 'Elegir imagen'}
          <input key={claveInput} id={id} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => onChange([...e.target.files])} />
        </label>
        <span className="text-tinta/70">
          {archivos.length === 0 && 'Ninguna imagen elegida'}
          {archivos.length === 1 && archivos[0].name}
          {archivos.length > 1 && `${archivos.length} imágenes elegidas`}
        </span>
      </div>
      {archivos.length > 1 && (
        <ul className="mt-2 list-inside list-disc text-sm text-tinta/70">
          {archivos.map((a) => <li key={a.name}>{a.name}</li>)}
        </ul>
      )}
    </div>
  )
}

// Pestañas para cambiar de vista dentro de una misma pantalla
export function Pestanas({ opciones, valor, onCambiar }) {
  return (
    <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-arena">
      {opciones.map(([clave, texto]) => (
        <button
          key={clave}
          type="button"
          role="tab"
          aria-selected={valor === clave}
          onClick={() => onCambiar(clave)}
          className={`whitespace-nowrap border-b-2 px-4 py-3 font-semibold ${valor === clave ? 'border-mar text-mar' : 'border-transparent text-tinta/70 hover:text-tinta'}`}
        >
          {texto}
        </button>
      ))}
    </div>
  )
}

// Tabla que en pantalla ancha es una tabla común y en celular muestra cada fila como una tarjeta apilada.
// columnas: títulos de las columnas ('' para la columna de acciones). Cada Celda lleva su "etiqueta" para el celular.
export function Tabla({ columnas, children }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
      <table className="block w-full text-left md:table">
        <thead className="hidden border-b border-arena text-sm text-tinta/70 md:table-header-group">
          <tr>
            {columnas.map((c, i) => (
              <th key={i} className="px-4 py-3 font-medium">{c || <span className="sr-only">Acciones</span>}</th>
            ))}
          </tr>
        </thead>
        <tbody className="block divide-y divide-arena md:table-row-group">{children}</tbody>
      </table>
    </div>
  )
}

export function Fila({ children }) {
  return <tr className="block px-4 py-3 md:table-row md:p-0">{children}</tr>
}

export function Celda({ etiqueta, className = '', children }) {
  return (
    <td className={`block py-1 md:table-cell md:px-4 md:py-3 ${className}`}>
      {etiqueta && <span className="block text-sm text-tinta/70 md:hidden">{etiqueta}</span>}
      {children}
    </td>
  )
}

// Formulario a la izquierda y un panel de ayuda a la derecha: así las pantallas de carga no quedan con la mitad vacía.
export function DosColumnas({ lateral, children }) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
      <div className="min-w-0">{children}</div>
      {lateral}
    </div>
  )
}

// pasos: lista de [ícono, título, texto]
export function PanelAyuda({ titulo, pasos }) {
  return (
    <aside className="max-w-md space-y-4 rounded-xl bg-mar/5 p-5 ring-1 ring-mar/10">
      <h2 className="font-display text-xl font-semibold">{titulo}</h2>
      <ul className="space-y-4">
        {pasos.map(([icono, encabezado, texto]) => (
          <li key={encabezado} className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-mar shadow-sm"><Icono nombre={icono} /></span>
            <span>
              <span className="block font-semibold">{encabezado}</span>
              <span className="block text-sm text-tinta/70">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
