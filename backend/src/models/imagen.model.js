const pool = require('../config/db');

async function listarPorAtencion(atencionId) {
  const [filas] = await pool.query(
    'SELECT id, atencion_id, url, descripcion FROM imagenes WHERE atencion_id = ? ORDER BY id',
    [atencionId]
  );
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT id, atencion_id, url, descripcion FROM imagenes WHERE id = ?', [id]);
  return filas[0];
}

async function crear({ atencion_id, url, descripcion }) {
  const [resultado] = await pool.query(
    'INSERT INTO imagenes (atencion_id, url, descripcion) VALUES (?, ?, ?)',
    [atencion_id, url, descripcion]
  );
  return resultado.insertId;
}

async function eliminar(id) {
  await pool.query('DELETE FROM imagenes WHERE id = ?', [id]);
}

module.exports = { listarPorAtencion, buscarPorId, crear, eliminar };
