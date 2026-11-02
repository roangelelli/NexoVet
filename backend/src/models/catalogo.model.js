const pool = require('../config/db');

async function listarEspecies() {
  const [filas] = await pool.query('SELECT id, nombre FROM especies ORDER BY id');
  return filas;
}

async function listarRazas(especieId) {
  let sql = 'SELECT id, especie_id, nombre FROM razas';
  const valores = [];

  if (especieId) {
    sql += ' WHERE especie_id = ?';
    valores.push(especieId);
  }

  const [filas] = await pool.query(sql + ' ORDER BY nombre', valores);
  return filas;
}

async function listarTiposVacuna() {
  const [filas] = await pool.query('SELECT id, nombre, intervalo_meses FROM tipos_vacuna ORDER BY nombre');
  return filas;
}

async function buscarEspecie(id) {
  const [filas] = await pool.query('SELECT id, nombre FROM especies WHERE id = ?', [id]);
  return filas[0];
}

async function buscarRaza(id) {
  const [filas] = await pool.query('SELECT id, especie_id, nombre FROM razas WHERE id = ?', [id]);
  return filas[0];
}

module.exports = { listarEspecies, listarRazas, listarTiposVacuna, buscarEspecie, buscarRaza };
