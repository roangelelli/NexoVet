const atencionService = require('../services/atencion.service');
const { AppError } = require('../middlewares/error.middleware');
const { esTexto, textoOpcional, esFecha, leerId, ahoraArgentina } = require('../middlewares/validaciones');

// Valida los datos de una atención (alta y modificación comparten estos campos)
function leerDatos(body = {}) {
  const { motivo, fecha, peso } = body;

  if (!esTexto(motivo, 255)) {
    throw new AppError(400, 'El motivo es obligatorio (máximo 255 caracteres).');
  }
  if (fecha !== undefined && fecha !== null) {
    if (!esFecha(fecha) || fecha > ahoraArgentina().fecha) {
      throw new AppError(400, 'La fecha no es válida (formato AAAA-MM-DD, no puede ser futura).');
    }
  }
  if (peso !== undefined && peso !== null) {
    if (typeof peso !== 'number' || peso <= 0 || peso >= 1000) {
      throw new AppError(400, 'El peso debe ser un número en kg, mayor a 0 y menor a 1000.');
    }
  }

  return {
    fecha: fecha || ahoraArgentina().fecha,
    motivo: motivo.trim(),
    diagnostico: textoOpcional(body.diagnostico, 5000, 'El diagnóstico'),
    tratamiento: textoOpcional(body.tratamiento, 5000, 'El tratamiento'),
    peso: peso ?? null,
    observaciones: textoOpcional(body.observaciones, 5000, 'Las observaciones'),
  };
}

// /api/atenciones?mascota_id=3  -> historia clínica de una mascota
async function listar(req, res) {
  if (!req.query.mascota_id) {
    throw new AppError(400, 'Indicá la mascota (?mascota_id=3).');
  }
  const atenciones = await atencionService.listar(req.usuario, leerId(req.query.mascota_id));
  res.json({ atenciones });
}

async function obtener(req, res) {
  res.json({ atencion: await atencionService.obtener(req.usuario, leerId(req.params.id)) });
}

async function crear(req, res) {
  const { mascota_id, turno_id } = req.body || {};

  if (!Number.isInteger(mascota_id)) {
    throw new AppError(400, 'Falta indicar la mascota (mascota_id).');
  }
  if (turno_id !== undefined && turno_id !== null && !Number.isInteger(turno_id)) {
    throw new AppError(400, 'El turno no es válido.');
  }

  const datos = { ...leerDatos(req.body), mascota_id, turno_id: turno_id || null };
  res.status(201).json({ atencion: await atencionService.crear(req.usuario, datos) });
}

async function actualizar(req, res) {
  const id = leerId(req.params.id);
  res.json({ atencion: await atencionService.actualizar(req.usuario, id, leerDatos(req.body)) });
}

module.exports = { listar, obtener, crear, actualizar };
