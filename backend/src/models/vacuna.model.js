const pool = require('../config/db');

// La próxima fecha no se guarda: es la fecha de aplicación + el intervalo del tipo de vacuna
const PROXIMA_FECHA = 'DATE_ADD(v.fecha_aplicacion, INTERVAL t.intervalo_meses MONTH)';

const SELECT_VACUNA = `
  SELECT v.id, v.mascota_id, v.tipo_vacuna_id, t.nombre AS tipo, t.intervalo_meses,
         v.fecha_aplicacion, ${PROXIMA_FECHA} AS proxima_fecha,
         v.veterinario_id, CONCAT(u.nombre, ' ', u.apellido) AS veterinario,
         v.lote, v.observaciones
  FROM vacunas v
  JOIN tipos_vacuna t ON t.id = v.tipo_vacuna_id
  JOIN usuarios u ON u.id = v.veterinario_id`;

// De la más nueva a la más vieja
async function listarPorMascota(mascotaId) {
  const [filas] = await pool.query(
    SELECT_VACUNA + ' WHERE v.mascota_id = ? ORDER BY v.fecha_aplicacion DESC, v.id DESC',
    [mascotaId]
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(SELECT_VACUNA + ' WHERE v.id = ?', [id]);
  return filas[0];
}

async function crear(d) {
  const [resultado] = await pool.query(
    `INSERT INTO vacunas (mascota_id, tipo_vacuna_id, fecha_aplicacion, veterinario_id, lote, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.mascota_id, d.tipo_vacuna_id, d.fecha_aplicacion, d.veterinario_id, d.lote, d.observaciones]
  );
  return resultado.insertId;
}

async function actualizar(id, d) {
  await pool.query(
    'UPDATE vacunas SET tipo_vacuna_id = ?, fecha_aplicacion = ?, lote = ?, observaciones = ? WHERE id = ?',
    [d.tipo_vacuna_id, d.fecha_aplicacion, d.lote, d.observaciones, id]
  );
}

// Para el reporte: la última aplicación de cada vacuna de cada mascota activa,
// cuya próxima fecha sea hasta "limite" (incluye las ya vencidas)
async function porVencer(limite) {
  const [filas] = await pool.query(
    `SELECT v.id, v.mascota_id, m.nombre AS mascota, m.cliente_id,
            CONCAT(c.nombre, ' ', c.apellido) AS cliente, c.telefono,
            t.nombre AS tipo, v.fecha_aplicacion, ${PROXIMA_FECHA} AS proxima_fecha
     FROM vacunas v
     JOIN tipos_vacuna t ON t.id = v.tipo_vacuna_id
     JOIN mascotas m ON m.id = v.mascota_id AND m.activo = TRUE
     JOIN usuarios c ON c.id = m.cliente_id
     WHERE t.intervalo_meses IS NOT NULL
       AND v.id = (SELECT v2.id FROM vacunas v2
                   WHERE v2.mascota_id = v.mascota_id AND v2.tipo_vacuna_id = v.tipo_vacuna_id
                   ORDER BY v2.fecha_aplicacion DESC, v2.id DESC LIMIT 1)
       AND ${PROXIMA_FECHA} <= ?
     ORDER BY proxima_fecha`,
    [limite]
  );
  return filas;
}

module.exports = { listarPorMascota, buscarPorId, crear, actualizar, porVencer };
