// Logo de NexoVet: una huella con cruz (veterinaria) dentro de un cuadrado redondeado.
export function Isotipo({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="9" fill="#1f5f6b" />
      <g fill="#fff">
        <ellipse cx="9.3" cy="14" rx="2.3" ry="2.9" transform="rotate(-18 9.3 14)" />
        <ellipse cx="13.6" cy="9.4" rx="2.4" ry="3" />
        <ellipse cx="18.4" cy="9.4" rx="2.4" ry="3" />
        <ellipse cx="22.7" cy="14" rx="2.3" ry="2.9" transform="rotate(18 22.7 14)" />
        <path d="M16 15c-3.6 0-6.6 3.1-6.6 6 0 2.3 1.8 3.2 3.6 3.2 1.2 0 2-.5 3-.5s1.8.5 3 .5c1.8 0 3.6-.9 3.6-3.2 0-2.9-3-6-6.6-6z" />
      </g>
      <path d="M16 17.6v5M13.5 20.1h5" stroke="#f0a23b" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

// Isotipo + nombre. "claro" es para usarlo sobre fondos oscuros.
export default function Marca({ claro = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Isotipo className="size-9" />
      <span className={`font-display text-2xl font-bold tracking-tight ${claro ? 'text-white' : 'text-mar'}`}>
        Nexo<span className={claro ? 'text-pomelo' : 'text-tinta'}>Vet</span>
      </span>
    </span>
  )
}
