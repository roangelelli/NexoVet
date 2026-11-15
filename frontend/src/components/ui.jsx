// Componentes chicos y reutilizables. Todas las pantallas arman sus formularios con estos.

const estilosBoton = {
  principal: 'bg-mar text-white hover:bg-mar-oscuro',
  secundario: 'bg-white text-tinta border border-arena hover:bg-arena',
  peligro: 'bg-error text-white hover:opacity-90',
}

export function Boton({ variante = 'principal', cargando = false, className = '', children, ...resto }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${estilosBoton[variante]} ${className}`}
      disabled={cargando || resto.disabled}
      {...resto}
    >
      {cargando ? 'Un momento…' : children}
    </button>
  )
}

export function Campo({ etiqueta, id, error, ayuda, className = '', ...resto }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{etiqueta}</label>
      <input
        id={id}
        className="min-h-11 w-full rounded-lg border border-arena bg-white px-3 text-base"
        aria-invalid={Boolean(error)}
        {...resto}
      />
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

export function Estado({ valor }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${coloresEstado[valor] || 'bg-arena'}`}>
      {String(valor).replace('_', ' ')}
    </span>
  )
}

export function Cargando({ texto = 'Cargando…' }) {
  return <p className="py-8 text-center text-tinta/70" role="status">{texto}</p>
}

export function Titulo({ children, accion }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{children}</h1>
      {accion}
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
