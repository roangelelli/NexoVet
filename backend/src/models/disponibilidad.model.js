const pool = require('../config/db');

async function obtenerDuracion() {
  const [filas] = await pool.query('SELECT duracion_turno_min FROM configuracion LIMIT 1');
  return filas[0] ? filas[0].duracion_turno_min : 30;
}

async function actualizarDuracion(minutos) {
  await pool.query('UPDATE configuracion SET duracion_turno_min = ?', [minutos]);
}

async function listarTramos() {
  const [filas] = await pool.query(
    `SELECT id, dia_semana, hora_inicio, hora_fin FROM disponibilidad
     WHERE activo = TRUE
     ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'), hora_inicio`
  );
  return filas;
}

async function tramosDelDia(dia) {
  const [filas] = await pool.query(
    'SELECT id, dia_semana, hora_inicio, hora_fin FROM disponibilidad WHERE dia_semana = ? AND activo = TRUE ORDER BY hora_inicio',
    [dia]
  );
  return filas;
}

async function buscarTramo(id) {
  const [filas] = await pool.query('SELECT id FROM disponibilidad WHERE id = ? AND activo = TRUE', [id]);
  return filas[0];
}

async function crearTramo({ dia_semana, hora_inicio, hora_fin }) {
  const [resultado] = await pool.query(
    'INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?)',
    [dia_semana, hora_inicio, hora_fin]
  );
  return resultado.insertId;
}

// Baja logica: el tramo queda inactivo
async function eliminarTramo(id) {
  await pool.query('UPDATE disponibilidad SET activo = FALSE WHERE id = ?', [id]);
}

async function listarDiasBloqueados() {
  const [filas] = await pool.query('SELECT id, fecha, motivo FROM dias_bloqueados ORDER BY fecha');
  return filas;
}

async function buscarDiaBloqueado(fecha) {
  const [filas] = await pool.query('SELECT id FROM dias_bloqueados WHERE fecha = ?', [fecha]);
  return filas[0];
}

async function buscarDiaBloqueadoPorId(id) {
  const [filas] = await pool.query('SELECT id FROM dias_bloqueados WHERE id = ?', [id]);
  return filas[0];
}

async function crearDiaBloqueado(fecha, motivo) {
  const [resultado] = await pool.query('INSERT INTO dias_bloqueados (fecha, motivo) VALUES (?, ?)', [fecha, motivo]);
  return resultado.insertId;
}

async function eliminarDiaBloqueado(id) {
  await pool.query('DELETE FROM dias_bloqueados WHERE id = ?', [id]);
}

// Horas ya ocupadas de un dia: turnos que no estan cancelados
async function horasOcupadas(fecha) {
  const [filas] = await pool.query("SELECT hora FROM turnos WHERE fecha = ? AND estado <> 'cancelado'", [fecha]);
  return filas.map((fila) => fila.hora.slice(0, 5));
}

module.exports = {
  obtenerDuracion,
  actualizarDuracion,
  listarTramos,
  tramosDelDia,
  buscarTramo,
  crearTramo,
  eliminarTramo,
  listarDiasBloqueados,
  buscarDiaBloqueado,
  buscarDiaBloqueadoPorId,
  crearDiaBloqueado,
  eliminarDiaBloqueado,
  horasOcupadas,
};
