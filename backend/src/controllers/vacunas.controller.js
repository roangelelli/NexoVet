const vacunaService = require('../services/vacuna.service');
const { AppError } = require('../middlewares/error.middleware');
const { textoOpcional, esFecha, leerId, ahoraArgentina } = require('../middlewares/validaciones');

// Valida los datos de una vacuna (alta y modificación comparten estos campos)
function leerDatos(body = {}) {
  const { tipo_vacuna_id, fecha_aplicacion } = body;

  if (!Number.isInteger(tipo_vacuna_id)) {
    throw new AppError(400, 'Falta indicar el tipo de vacuna (tipo_vacuna_id).');
  }
  if (!esFecha(fecha_aplicacion) || fecha_aplicacion > ahoraArgentina().fecha) {
    throw new AppError(400, 'La fecha de aplicación no es válida (formato AAAA-MM-DD, no puede ser futura).');
  }

  return {
    tipo_vacuna_id,
    fecha_aplicacion,
    lote: textoOpcional(body.lote, 50, 'El lote'),
    observaciones: textoOpcional(body.observaciones, 255, 'Las observaciones'),
  };
}

// /api/vacunas?mascota_id=3  -> carnet de vacunas de una mascota
async function listar(req, res) {
  if (!req.query.mascota_id) {
    throw new AppError(400, 'Indicá la mascota (?mascota_id=3).');
  }
  const vacunas = await vacunaService.listar(req.usuario, leerId(req.query.mascota_id));
  res.json({ vacunas });
}

async function crear(req, res) {
  const { mascota_id } = req.body || {};

  if (!Number.isInteger(mascota_id)) {
    throw new AppError(400, 'Falta indicar la mascota (mascota_id).');
  }

  const datos = { ...leerDatos(req.body), mascota_id };
  res.status(201).json({ vacuna: await vacunaService.crear(req.usuario, datos) });
}

async function actualizar(req, res) {
  const id = leerId(req.params.id);
  res.json({ vacuna: await vacunaService.actualizar(req.usuario, id, leerDatos(req.body)) });
}

module.exports = { listar, crear, actualizar };
