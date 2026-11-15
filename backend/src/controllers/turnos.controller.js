const turnoService = require('../services/turno.service');
const { AppError } = require('../middlewares/error.middleware');
const { textoOpcional, esFecha, esHora, leerId } = require('../middlewares/validaciones');

const ESTADOS = ['solicitado', 'confirmado', 'atendido', 'cancelado'];

// /api/turnos?fecha=2026-11-10&estado=solicitado&mascota_id=3  (todos los filtros son opcionales)
async function listar(req, res) {
  const { fecha, estado, mascota_id } = req.query;

  if (fecha !== undefined && !esFecha(fecha)) {
    throw new AppError(400, 'La fecha debe tener el formato AAAA-MM-DD.');
  }
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    throw new AppError(400, 'El estado debe ser: solicitado, confirmado, atendido o cancelado.');
  }

  const filtros = { fecha, estado, mascotaId: mascota_id ? leerId(mascota_id) : null };
  res.json({ turnos: await turnoService.listar(req.usuario, filtros) });
}

async function obtener(req, res) {
  res.json({ turno: await turnoService.obtener(req.usuario, leerId(req.params.id)) });
}

async function crear(req, res) {
  const { mascota_id, fecha, hora } = req.body || {};

  if (!Number.isInteger(mascota_id)) {
    throw new AppError(400, 'Falta indicar la mascota (mascota_id).');
  }
  if (!esFecha(fecha) || !esHora(hora)) {
    throw new AppError(400, 'Indicá la fecha (AAAA-MM-DD) y la hora (HH:MM) del turno.');
  }
  const motivo = textoOpcional(req.body.motivo, 255, 'El motivo');

  const turno = await turnoService.crear(req.usuario, { mascota_id, fecha, hora, motivo });
  res.status(201).json({ turno });
}

async function confirmar(req, res) {
  res.json({ turno: await turnoService.cambiarEstado(req.usuario, leerId(req.params.id), 'confirmar') });
}

async function atender(req, res) {
  res.json({ turno: await turnoService.cambiarEstado(req.usuario, leerId(req.params.id), 'atender') });
}

async function cancelar(req, res) {
  res.json({ turno: await turnoService.cambiarEstado(req.usuario, leerId(req.params.id), 'cancelar') });
}

module.exports = { listar, obtener, crear, confirmar, atender, cancelar };
