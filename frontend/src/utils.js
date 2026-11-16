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

// Primer y último día de un mes: 0 = este mes, -1 = el mes anterior
export function rangoMes(desplazamiento = 0) {
  const ahora = new Date()
  const primero = new Date(ahora.getFullYear(), ahora.getMonth() + desplazamiento, 1, 12)
  const ultimo = new Date(primero.getFullYear(), primero.getMonth() + 1, 0, 12)
  return [aTexto(primero), aTexto(ultimo)]
}

// Días de diferencia entre dos fechas AAAA-MM-DD (negativo si "hasta" es anterior)
export function diasEntre(desde, hasta) {
  return Math.round((new Date(hasta + 'T12:00:00') - new Date(desde + 'T12:00:00')) / 86400000)
}

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

// "Hoy", "Mañana" o "jue 19/11" para mostrar cuándo es un turno
export function etiquetaDia(fecha) {
  const f = fecha.slice(0, 10)
  if (f === hoy()) return 'Hoy'
  if (f === sumarDias(hoy(), 1)) return 'Mañana'
  return `${DIAS_CORTOS[new Date(f + 'T12:00:00').getDay()]} ${fechaLegible(f).slice(0, 5)}`
}

// Hora actual como HH:MM (hora local del navegador)
export function horaActual() {
  const d = new Date()
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`
}
