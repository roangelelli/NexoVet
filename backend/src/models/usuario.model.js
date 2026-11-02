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

async function listarClientes(buscar) {
  let sql = `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE rol = 'cliente' AND activo = TRUE`;
  const valores = [];

  if (buscar) {
    sql += ' AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)';
    valores.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
  }

  const [filas] = await pool.query(sql + ' ORDER BY apellido, nombre', valores);
  return filas;
}

async function actualizarDatos(id, { nombre, apellido, telefono }) {
  await pool.query('UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?', [
    nombre,
    apellido,
    telefono,
    id,
  ]);
}

// Baja logica: el usuario no se borra, queda inactivo
async function darDeBaja(id) {
  await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
}

async function contarTablas() {
  const [filas] = await pool.query(
    'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE()'
  );
  return filas[0].total;
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  crear,
  listarPersonal,
  listarClientes,
  actualizarDatos,
  darDeBaja,
  contarTablas,
};
