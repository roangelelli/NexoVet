const authService = require('../services/auth.service');
const Usuario = require('../models/usuario.model');
const { AppError } = require('../middlewares/error.middleware');
const { esTexto, textoOpcional, leerId, validarNuevoCliente } = require('../middlewares/validaciones');

// El personal accede a cualquier cliente; un cliente solo a si mismo
function verificarAcceso(solicitante, idCliente) {
  if (solicitante.rol === 'cliente' && solicitante.id !== idCliente) {
    throw new AppError(403, 'No tenés permiso para ver o modificar a otro cliente.');
  }
}

async function buscarCliente(id) {
  const cliente = await Usuario.buscarPorId(id);
  if (!cliente || cliente.rol !== 'cliente') {
    throw new AppError(404, 'Cliente no encontrado.');
  }
  return cliente;
}

async function listar(req, res) {
  const buscar = typeof req.query.buscar === 'string' ? req.query.buscar.trim() : '';
  res.json({ clientes: await Usuario.listarClientes(buscar) });
}

async function obtener(req, res) {
  const id = leerId(req.params.id);
  verificarAcceso(req.usuario, id);
  res.json({ cliente: await buscarCliente(id) });
}

// Alta de un cliente por parte del personal
async function crear(req, res) {
  validarNuevoCliente(req.body);
  const { usuario } = await authService.registrarCliente(req.body);
  res.status(201).json({ cliente: usuario });
}

async function actualizar(req, res) {
  const id = leerId(req.params.id);
  verificarAcceso(req.usuario, id);
  await buscarCliente(id);

  const { nombre, apellido } = req.body || {};
  if (!esTexto(nombre, 80) || !esTexto(apellido, 80)) {
    throw new AppError(400, 'Nombre y apellido son obligatorios.');
  }
  const telefono = textoOpcional(req.body.telefono, 30, 'El teléfono');

  await Usuario.actualizarDatos(id, { nombre: nombre.trim(), apellido: apellido.trim(), telefono });
  res.json({ cliente: await buscarCliente(id) });
}

async function eliminar(req, res) {
  const id = leerId(req.params.id);
  await buscarCliente(id);
  await Usuario.darDeBaja(id);
  res.json({ mensaje: 'Cliente dado de baja.' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
