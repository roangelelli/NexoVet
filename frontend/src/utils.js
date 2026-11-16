const dos = (n) => String(n).padStart(2, '0')
const aTexto = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`

// Fecha AAAA-MM-DD de hoy (hora local del navegador)
export function hoy() {
  return aTexto(new Date())
}

// Suma (o resta) días a una fecha AAAA-MM-DD
export function sumarDias(fecha, dias) {
  const d = new Date(fecha + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return aTexto(d)
}

// Lunes de la semana de una fecha AAAA-MM-DD
export function lunesDe(fecha) {
  const d = new Date(fecha + 'T12:00:00')
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return aTexto(d)
}

// 2024-03-15 → 15/03/2024
export function fechaLegible(fecha) {
  if (!fecha) return '—'
  const [a, m, d] = fecha.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

// Edad aproximada a partir de la fecha de nacimiento: "3 años", "8 meses"
export function edadTexto(fechaNacimiento) {
  if (!fechaNacimiento) return '—'
  const [a, m, d] = fechaNacimiento.slice(0, 10).split('-').map(Number)
  const ahora = new Date()
  let meses = (ahora.getFullYear() - a) * 12 + (ahora.getMonth() + 1 - m)
  if (ahora.getDate() < d) meses -= 1
  if (meses < 1) return 'menos de 1 mes'
  if (meses < 12) return meses === 1 ? '1 mes' : `${meses} meses`
  const anios = Math.floor(meses / 12)
  return anios === 1 ? '1 año' : `${anios} años`
}
