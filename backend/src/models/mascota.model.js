const pool = require('../config/db');

// Mascota con el nombre de su especie y raza
const SELECT_MASCOTA = `
  SELECT m.id, m.cliente_id, m.nombre, m.especie_id, e.nombre AS especie,
         m.raza_id, r.nombre AS raza, m.especie_otra, m.sexo, m.fecha_nacimiento,
         m.microchip, m.color, m.esterilizado, m.activo
  FROM mascotas m
  JOIN especies e ON e.id = m.especie_id
  LEFT JOIN razas r ON r.id = m.raza_id`;

async function listar({ clienteId, buscar }) {
  let sql = SELECT_MASCOTA + ' WHERE m.activo = TRUE';
  const valores = [];

  if (clienteId) {
    sql += ' AND m.cliente_id = ?';
    valores.push(clienteId);
  }
  if (buscar) {
    sql += ' AND m.nombre LIKE ?';
    valores.push(`%${buscar}%`);
  }

  const [filas] = await pool.query(sql + ' ORDER BY m.nombre', valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(SELECT_MASCOTA + ' WHERE m.id = ?', [id]);
  return filas[0];
}

async function crear(d) {
  const [resultado] = await pool.query(
    `INSERT INTO mascotas
       (cliente_id, nombre, especie_id, raza_id, especie_otra, sexo, fecha_nacimiento, microchip, color, esterilizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.cliente_id, d.nombre, d.especie_id, d.raza_id, d.especie_otra, d.sexo, d.fecha_nacimiento, d.microchip, d.color, d.esterilizado]
  );
  return resultado.insertId;
}

async function actualizar(id, d) {
  await pool.query(
    `UPDATE mascotas
     SET nombre = ?, especie_id = ?, raza_id = ?, especie_otra = ?, sexo = ?,
         fecha_nacimiento = ?, microchip = ?, color = ?, esterilizado = ?
     WHERE id = ?`,
    [d.nombre, d.especie_id, d.raza_id, d.especie_otra, d.sexo, d.fecha_nacimiento, d.microchip, d.color, d.esterilizado, id]
  );
}

// Baja logica: la mascota no se borra, queda inactiva
async function darDeBaja(id) {
  await pool.query('UPDATE mascotas SET activo = FALSE WHERE id = ?', [id]);
}

module.exports = { listar, buscarPorId, crear, actualizar, darDeBaja };
