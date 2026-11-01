const authService = require('../services/auth.service');
const Usuario = require('../models/usuario.model');
const { AppError } = require('../middlewares/error.middleware');

function esTexto(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!esTexto(email) || !esTexto(password)) {
    throw new AppError(400, 'Email y contraseña son obligatorios.');
  }

  res.json(await authService.login(email, password));
}

async function registro(req, res) {
  const { nombre, apellido, email, password } = req.body || {};

  if (!esTexto(nombre) || !esTexto(apellido)) {
    throw new AppError(400, 'Nombre y apellido son obligatorios.');
  }
  if (!esTexto(email) || !email.includes('@')) {
    throw new AppError(400, 'El email no es válido.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }

  res.status(201).json(await authService.registrarCliente(req.body));
}

async function me(req, res) {
  const usuario = await Usuario.buscarPorId(req.usuario.id);

  if (!usuario || !usuario.activo) {
    throw new AppError(401, 'La sesión ya no es válida.');
  }

  res.json({ usuario });
}

module.exports = { login, registro, me };
