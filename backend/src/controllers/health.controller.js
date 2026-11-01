const Usuario = require('../models/usuario.model');

// Confirma que la API responde y que llega a la base de datos
async function verificar(req, res) {
  try {
    const tablas = await Usuario.contarTablas();
    res.json({ api: 'ok', base_de_datos: 'ok', tablas });
  } catch (err) {
    console.error('Error de base de datos:', err.message);
    res.status(503).json({ api: 'ok', base_de_datos: 'error' });
  }
}

module.exports = { verificar };
