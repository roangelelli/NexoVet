const Disponibilidad = require('../models/disponibilidad.model');
const { AppError } = require('../middlewares/error.middleware');
const { ahoraArgentina } = require('../middlewares/validaciones');

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

// "09:30" -> 570 minutos desde las 00:00 (para poder comparar y sumar horas)
function aMinutos(hora) {
  return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
}

// 570 -> "09:30"
function aHora(minutos) {
  const horas = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mins = String(minutos % 60).padStart(2, '0');
  return `${horas}:${mins}`;
}

async function obtenerConfiguracion() {
  const tramos = await Disponibilidad.listarTramos();

  return {
    duracion_turno_min: await Disponibilidad.obtenerDuracion(),
    tramos: tramos.map((t) => ({
      id: t.id,
      dia_semana: t.dia_semana,
      hora_inicio: t.hora_inicio.slice(0, 5),
      hora_fin: t.hora_fin.slice(0, 5),
    })),
    dias_bloqueados: await Disponibilidad.listarDiasBloqueados(),
  };
}

async function crearTramo({ dia_semana, hora_inicio, hora_fin }) {
  if (aMinutos(hora_inicio) >= aMinutos(hora_fin)) {
    throw new AppError(400, 'La hora de inicio debe ser anterior a la hora de fin.');
  }

  // No puede pisarse con otro tramo del mismo dia
  const tramosDelDia = await Disponibilidad.tramosDelDia(dia_semana);
  const sePisa = tramosDelDia.some(
    (t) => aMinutos(hora_inicio) < aMinutos(t.hora_fin) && aMinutos(t.hora_inicio) < aMinutos(hora_fin)
  );
  if (sePisa) {
    throw new AppError(409, 'El tramo se superpone con otro del mismo día.');
  }

  await Disponibilidad.crearTramo({ dia_semana, hora_inicio, hora_fin });
}

async function eliminarTramo(id) {
  if (!(await Disponibilidad.buscarTramo(id))) {
    throw new AppError(404, 'Tramo no encontrado.');
  }
  await Disponibilidad.eliminarTramo(id);
}

async function crearDiaBloqueado(fecha, motivo) {
  if (await Disponibilidad.buscarDiaBloqueado(fecha)) {
    throw new AppError(409, 'Ese día ya está bloqueado.');
  }
  await Disponibilidad.crearDiaBloqueado(fecha, motivo);
}

async function eliminarDiaBloqueado(id) {
  if (!(await Disponibilidad.buscarDiaBloqueadoPorId(id))) {
    throw new AppError(404, 'Día bloqueado no encontrado.');
  }
  await Disponibilidad.eliminarDiaBloqueado(id);
}

// Calcula las franjas libres de un dia. Las franjas NO se guardan: se calculan cada vez.
async function calcularFranjas(fecha) {
  const ahora = ahoraArgentina();

  // Sin franjas en dias pasados ni en dias bloqueados
  if (fecha < ahora.fecha || (await Disponibilidad.buscarDiaBloqueado(fecha))) {
    return [];
  }

  const dia = DIAS[new Date(fecha + 'T12:00:00Z').getUTCDay()];
  const duracion = await Disponibilidad.obtenerDuracion();
  const tramos = await Disponibilidad.tramosDelDia(dia);
  const ocupadas = await Disponibilidad.horasOcupadas(fecha);

  const franjas = [];
  for (const tramo of tramos) {
    const fin = aMinutos(tramo.hora_fin);

    // Se parte el tramo en franjas de "duracion" minutos
    for (let inicio = aMinutos(tramo.hora_inicio); inicio + duracion <= fin; inicio += duracion) {
      const hora = aHora(inicio);
      const yaPaso = fecha === ahora.fecha && hora <= ahora.hora;

      if (!ocupadas.includes(hora) && !yaPaso) {
        franjas.push(hora);
      }
    }
  }
  return franjas;
}

module.exports = {
  obtenerConfiguracion,
  crearTramo,
  eliminarTramo,
  crearDiaBloqueado,
  eliminarDiaBloqueado,
  calcularFranjas,
};
