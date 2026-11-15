const pool = require('../config/db');

// Atención con el nombre de la mascota, su dueño y el veterinario que la hizo
const SELECT_ATENCION = `
  SELECT a.id, a.mascota_id, m.nombre AS mascota, m.cliente_id, a.turno_id,
         a.veterinario_id, CONCAT(v.nombre, ' ', v.apellido) AS veterinario,
         a.fecha, a.motivo, a.diagnostico, a.tratamiento,
         CAST(a.peso AS DOUBLE) AS peso, a.observaciones
  FROM atenciones a
  JOIN mascotas m ON m.id = a.mascota_id
  JOIN usuarios v ON v.id = a.veterinario_id`;

async function listarPorMascota(mascotaId) {
  const [filas] = await pool.query(
    SELECT_ATENCION + ' WHERE a.mascota_id = ? ORDER BY a.fecha DESC, a.id DESC',
    [mascotaId]
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(SELECT_ATENCION + ' WHERE a.id = ?', [id]);
  return filas[0];
}

async function crear(d) {
  const [resultado] = await pool.query(
    `INSERT INTO atenciones
       (mascota_id, turno_id, veterinario_id, fecha, motivo, diagnostico, tratamiento, peso, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.mascota_id, d.turno_id, d.veterinario_id, d.fecha, d.motivo, d.diagnostico, d.tratamiento, d.peso, d.observaciones]
  );
  return resultado.insertId;
}

// La mascota, el turno y el veterinario original no se modifican
async function actualizar(id, d) {
  await pool.query(
    `UPDATE atenciones
     SET fecha = ?, motivo = ?, diagnostico = ?, tratamiento = ?, peso = ?, observaciones = ?
     WHERE id = ?`,
    [d.fecha, d.motivo, d.diagnostico, d.tratamiento, d.peso, d.observaciones, id]
  );
}

module.exports = { listarPorMascota, buscarPorId, crear, actualizar };
