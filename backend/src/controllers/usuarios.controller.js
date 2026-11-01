const Usuario = require('../models/usuario.model');

// Listado del personal, solo lectura
async function listarPersonal(req, res) {
  res.json({ personal: await Usuario.listarPersonal() });
}

module.exports = { listarPersonal };
