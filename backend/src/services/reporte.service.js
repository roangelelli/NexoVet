const Turno = require('../models/turno.model');
const Vacuna = require('../models/vacuna.model');
const { ahoraArgentina, sumarDias } = require('../middlewares/validaciones');
const { calcularEstado } = require('./vacuna.service');

// Turnos de un día, con la cantidad de cada estado
async function turnosDelDia(fecha) {
  const turnos = await Turno.listar({ fecha });

  const porEstado = { solicitado: 0, confirmado: 0, atendido: 0, cancelado: 0 };
  for (const turno of turnos) {
    porEstado[turno.estado]++;
  }

  return { fecha, total: turnos.length, por_estado: porEstado, turnos };
}

// Mascotas con una vacuna vencida o que vence en los próximos "dias" días
async function vacunasPorVencer(dias) {
  const hasta = sumarDias(ahoraArgentina().fecha, dias);
  const vacunas = await Vacuna.porVencer(hasta);

  return {
    hasta,
    vacunas: vacunas.map((vacuna) => ({ ...vacuna, estado: calcularEstado(vacuna.proxima_fecha) })),
  };
}

module.exports = { turnosDelDia, vacunasPorVencer };
