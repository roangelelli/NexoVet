const pool = require('../config/db');

// Turno con los datos de la mascota y de su dueño
const SELECT_TURNO = `
  SELECT t.id, t.mascota_id, m.nombre AS mascota, m.cliente_id,
         CONCAT(u.nombre, ' ', u.apellido) AS cliente,
         t.fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora, t.motivo, t.estado
  FROM turnos t
  JOIN mascotas m ON m.id = t.mascota_id
  JOIN usuarios u ON u.id = m.cliente_id`;

async function listar({ clienteId, mascotaId, fecha, estado }) {
  const condiciones = [];
  const valores = [];

  if (clienteId) {
    condiciones.push('m.cliente_id = ?');
    valores.push(clienteId);
  }
  if (mascotaId) {
    condiciones.push('t.mascota_id = ?');
    valores.push(mascotaId);
  }
  if (fecha) {
    condiciones.push('t.fecha = ?');
    valores.push(fecha);
  }
  if (estado) {
    condiciones.push('t.estado = ?');
    valores.push(estado);
  }

  const where = condiciones.length ? ' WHERE ' + condiciones.join(' AND ') : '';
  const [filas] = await pool.query(SELECT_TURNO + where + ' ORDER BY t.fecha, t.hora', valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(SELECT_TURNO + ' WHERE t.id = ?', [id]);
  return filas[0];
}

async function crear({ mascota_id, fecha, hora, motivo }) {
  const [resultado] = await pool.query(
    'INSERT INTO turnos (mascota_id, fecha, hora, motivo) VALUES (?, ?, ?, ?)',
    [mascota_id, fecha, hora, motivo]
  );
  return resultado.insertId;
}

async function cambiarEstado(id, estado) {
  await pool.query('UPDATE turnos SET estado = ? WHERE id = ?', [estado, id]);
}

module.exports = { listar, buscarPorId, crear, cambiarEstado };
