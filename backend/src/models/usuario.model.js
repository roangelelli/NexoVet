const pool = require('../config/db');

// Columnas que se pueden mostrar (nunca password_hash)
const COLUMNAS_PUBLICAS = 'id, nombre, apellido, email, telefono, rol, activo';

async function buscarPorEmail(email) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas[0];
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`, [id]);
  return filas[0];
}

async function crear({ nombre, apellido, email, passwordHash, telefono, rol }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, apellido, email, passwordHash, telefono, rol]
  );
  return resultado.insertId;
}

async function listarPersonal() {
  const [filas] = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios
     WHERE rol IN ('recepcion', 'veterinario') AND activo = TRUE
     ORDER BY apellido, nombre`
  );
  return filas;
}

async function contarTablas() {
  const [filas] = await pool.query(
    'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE()'
  );
  return filas[0].total;
}

module.exports = { buscarPorEmail, buscarPorId, crear, listarPersonal, contarTablas };
