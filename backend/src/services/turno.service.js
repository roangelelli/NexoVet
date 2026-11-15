const Turno = require('../models/turno.model');
const mascotaService = require('./mascota.service');
const disponibilidadService = require('./disponibilidad.service');
const { AppError } = require('../middlewares/error.middleware');

// Estados desde los que se puede hacer cada acción, y a cuál se pasa
// solicitado -> confirmado -> atendido        (cancelado se puede desde solicitado o confirmado)
const ACCIONES = {
  confirmar: { desde: ['solicitado'], hacia: 'confirmado' },
  atender: { desde: ['confirmado'], hacia: 'atendido' },
  cancelar: { desde: ['solicitado', 'confirmado'], hacia: 'cancelado' },
};

// Un cliente ve solo los turnos de sus mascotas; el personal ve todos
function listar(solicitante, filtros) {
  if (solicitante.rol === 'cliente') filtros.clienteId = solicitante.id;
  return Turno.listar(filtros);
}

async function obtener(solicitante, id) {
  const turno = await Turno.buscarPorId(id);
  const esDeOtroCliente = turno && solicitante.rol === 'cliente' && turno.cliente_id !== solicitante.id;

  // Si es de otro cliente respondemos "no encontrado", igual que si no existiera
  if (!turno || esDeOtroCliente) {
    throw new AppError(404, 'Turno no encontrado.');
  }
  return turno;
}

async function crear(solicitante, datos) {
  // Si la mascota es de otro cliente, esto responde 404
  const mascota = await mascotaService.obtener(solicitante, datos.mascota_id);
  if (!mascota.activo) {
    throw new AppError(400, 'La mascota está dada de baja.');
  }

  // 1ra barrera: la franja tiene que figurar libre
  const libres = await disponibilidadService.calcularFranjas(datos.fecha);
  if (!libres.includes(datos.hora)) {
    throw new AppError(409, 'Esa franja no está disponible.');
  }

  // 2da barrera: si dos clientes reservan a la vez, la base rechaza al segundo (restricción única)
  try {
    const id = await Turno.crear(datos);
    return Turno.buscarPorId(id);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'Esa franja ya fue reservada por otra persona.');
    }
    throw err;
  }
}

// Confirmar, atender o cancelar un turno
async function cambiarEstado(solicitante, id, accion) {
  const turno = await obtener(solicitante, id);
  const { desde, hacia } = ACCIONES[accion];

  if (!desde.includes(turno.estado)) {
    throw new AppError(409, `No se puede ${accion} un turno que está ${turno.estado}.`);
  }

  await Turno.cambiarEstado(id, hacia);
  return Turno.buscarPorId(id);
}

module.exports = { listar, obtener, crear, cambiarEstado };
