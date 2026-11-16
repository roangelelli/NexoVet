import Icono from './Icono'

// Ilustraciones propias de perro y gato (SVG), usadas en el acceso y como avatar de las mascotas.
export function Gato({ className = 'size-16' }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M12 30 L14 8 Q14.3 6.6 15.6 7.2 L29 16 Z" fill="#f0a23b" stroke="#f0a23b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 30 L50 8 Q49.7 6.6 48.4 7.2 L35 16 Z" fill="#f0a23b" stroke="#f0a23b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16.5 24 L17 14 L24 19Z M47.5 24 L47 14 L40 19Z" fill="#fbd9a3" />
      <ellipse cx="32" cy="37" rx="21" ry="18" fill="#f0a23b" />
      <ellipse cx="32" cy="43" rx="9" ry="7" fill="#fbd9a3" />
      <ellipse cx="23.5" cy="35" rx="2.4" ry="3" fill="#14272b" />
      <ellipse cx="40.5" cy="35" rx="2.4" ry="3" fill="#14272b" />
      <circle cx="24.2" cy="34" r=".9" fill="#fff" />
      <circle cx="41.2" cy="34" r=".9" fill="#fff" />
      <path d="M29.5 41h5l-2.5 3z" fill="#b3392f" stroke="#b3392f" strokeWidth="1" strokeLinejoin="round" />
      <path d="M32 44v2M32 46q-3 3-6 1M32 46q3 3 6 1" fill="none" stroke="#14272b" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 40l-8-2M14 44l-8 2M50 40l8-2M50 44l8 2" stroke="#14272b" strokeWidth="1.3" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

export function Perro({ className = 'size-16' }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="13" cy="33" rx="8" ry="15" fill="#174a54" transform="rotate(12 13 33)" />
      <ellipse cx="51" cy="33" rx="8" ry="15" fill="#174a54" transform="rotate(-12 51 33)" />
      <ellipse cx="32" cy="34" rx="18" ry="20" fill="#fff" />
      <ellipse cx="40.5" cy="30" rx="8" ry="8.5" fill="#e8c9a0" />
      <ellipse cx="32" cy="43" rx="10" ry="8" fill="#dfe8e6" />
      <ellipse cx="24" cy="33" rx="2.4" ry="2.8" fill="#14272b" />
      <ellipse cx="40" cy="33" rx="2.4" ry="2.8" fill="#14272b" />
      <circle cx="24.7" cy="32" r=".9" fill="#fff" />
      <circle cx="40.7" cy="32" r=".9" fill="#fff" />
      <ellipse cx="32" cy="39.5" rx="4.2" ry="3" fill="#14272b" />
      <path d="M32 42v3M32 45q-3.5 3-7 .5M32 45q3.5 3 7 .5" fill="none" stroke="#14272b" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M30.2 47.5q1.8 4 3.6 0z" fill="#f0a23b" />
    </svg>
  )
}

// Círculo con la cara de la especie: perro, gato o un ícono de huella para el resto.
export function AvatarMascota({ especie, tamano = 'size-12' }) {
  const fondo = especie === 'Gato' ? 'bg-pomelo/20' : especie === 'Perro' ? 'bg-mar/10' : 'bg-arena'
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${fondo} ${tamano}`}>
      {especie === 'Gato' && <Gato className="size-[85%]" />}
      {especie === 'Perro' && <Perro className="size-[85%]" />}
      {especie !== 'Gato' && especie !== 'Perro' && <Icono nombre="huella" className="size-1/2 text-mar" />}
    </span>
  )
}
