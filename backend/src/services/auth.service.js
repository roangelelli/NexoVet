const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const { AppError } = require('../middlewares/error.middleware');

function crearToken(usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

async function login(email, password) {
  const usuario = await Usuario.buscarPorEmail(email.trim().toLowerCase());

  // Mismo mensaje en todos los casos, para no revelar si el email existe
  const error = new AppError(401, 'Email o contraseña incorrectos.');
  if (!usuario || !usuario.activo) throw error;

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) throw error;

  const { password_hash, ...datosUsuario } = usuario; // todo menos el hash
  return { token: crearToken(usuario), usuario: datosUsuario };
}

// El autorregistro siempre crea un cliente: el rol nunca viene del pedido
async function registrarCliente({ nombre, apellido, email, password, telefono }) {
  const emailNormalizado = email.trim().toLowerCase();

  if (await Usuario.buscarPorEmail(emailNormalizado)) {
    throw new AppError(409, 'Ya existe una cuenta con ese email.');
  }

  const id = await Usuario.crear({
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: emailNormalizado,
    passwordHash: await bcrypt.hash(password, 10),
    telefono: telefono || null,
    rol: 'cliente',
  });

  const usuario = await Usuario.buscarPorId(id);
  return { token: crearToken(usuario), usuario };
}

module.exports = { login, registrarCliente };
