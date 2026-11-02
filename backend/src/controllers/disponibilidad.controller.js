const Disponibilidad = require('../models/disponibilidad.model');
const disponibilidadService = require('../services/disponibilidad.service');
const { AppError } = require('../middlewares/error.middleware');
const { esFecha, esHora, textoOpcional, leerId } = require('../middlewares/validaciones');

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

async function obtener(req, res) {
  res.json(await disponibilidadService.obtenerConfiguracion());
}

async function actualizarDuracion(req, res) {
  const minutos = (req.body || {}).duracion_turno_min;

  if (!Number.isInteger(minutos) || minutos < 10 || minutos > 120) {
    throw new AppError(400, 'La duración del turno debe ser un número entero entre 10 y 120 minutos.');
  }

  await Disponibilidad.actualizarDuracion(minutos);
  res.json({ duracion_turno_min: minutos });
}

async function crearTramo(req, res) {
  const { dia_semana, hora_inicio, hora_fin } = req.body || {};

  if (!DIAS_SEMANA.includes(dia_semana)) {
    throw new AppError(400, 'El día debe ser: lunes, martes, miercoles, jueves, viernes, sabado o domingo.');
  }
  if (!esHora(hora_inicio) || !esHora(hora_fin)) {
    throw new AppError(400, 'Las horas deben tener el formato HH:MM (por ejemplo 09:00).');
  }

  await disponibilidadService.crearTramo({ dia_semana, hora_inicio, hora_fin });
  res.status(201).json(await disponibilidadService.obtenerConfiguracion());
}

async function eliminarTramo(req, res) {
  await disponibilidadService.eliminarTramo(leerId(req.params.id));
  res.json({ mensaje: 'Tramo eliminado.' });
}

async function crearDiaBloqueado(req, res) {
  const { fecha } = req.body || {};

  if (!esFecha(fecha)) {
    throw new AppError(400, 'La fecha debe tener el formato AAAA-MM-DD.');
  }
  const motivo = textoOpcional(req.body.motivo, 150, 'El motivo');

  await disponibilidadService.crearDiaBloqueado(fecha, motivo);
  res.status(201).json(await disponibilidadService.obtenerConfiguracion());
}

async function eliminarDiaBloqueado(req, res) {
  await disponibilidadService.eliminarDiaBloqueado(leerId(req.params.id));
  res.json({ mensaje: 'Día desbloqueado.' });
}

// Franjas libres de un dia: /api/disponibilidad/franjas?fecha=2026-11-10
async function franjas(req, res) {
  const { fecha } = req.query;

  if (!esFecha(fecha)) {
    throw new AppError(400, 'Indicá la fecha con el formato AAAA-MM-DD (?fecha=2026-11-10).');
  }

  res.json({ fecha, franjas: await disponibilidadService.calcularFranjas(fecha) });
}

module.exports = {
  obtener,
  actualizarDuracion,
  crearTramo,
  eliminarTramo,
  crearDiaBloqueado,
  eliminarDiaBloqueado,
  franjas,
};
