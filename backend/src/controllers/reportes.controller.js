const reporteService = require('../services/reporte.service');
const { AppError } = require('../middlewares/error.middleware');
const { esFecha, ahoraArgentina } = require('../middlewares/validaciones');

// /api/reportes/turnos-del-dia?fecha=2026-11-10   (sin fecha, usa hoy)
async function turnosDelDia(req, res) {
  const fecha = req.query.fecha || ahoraArgentina().fecha;

  if (!esFecha(fecha)) {
    throw new AppError(400, 'La fecha debe tener el formato AAAA-MM-DD.');
  }

  res.json(await reporteService.turnosDelDia(fecha));
}

// /api/reportes/vacunas-por-vencer?dias=30   (sin dias, usa 30)
async function vacunasPorVencer(req, res) {
  const dias = req.query.dias === undefined ? 30 : Number(req.query.dias);

  if (!Number.isInteger(dias) || dias < 0 || dias > 365) {
    throw new AppError(400, 'Los días deben ser un número entero entre 0 y 365.');
  }

  res.json(await reporteService.vacunasPorVencer(dias));
}

module.exports = { turnosDelDia, vacunasPorVencer };
