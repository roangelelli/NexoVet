const Atencion = require('../models/atencion.model');
const Imagen = require('../models/imagen.model');
const Mascota = require('../models/mascota.model');
const Turno = require('../models/turno.model');
const mascotaService = require('./mascota.service');
const { AppError } = require('../middlewares/error.middleware');

// Historia clínica de una mascota (si es de otro cliente, responde 404)
async function listar(solicitante, mascotaId) {
  await mascotaService.obtener(solicitante, mascotaId);
  return Atencion.listarPorMascota(mascotaId);
}

// Una atención con sus imágenes
async function obtener(solicitante, id) {
  const atencion = await Atencion.buscarPorId(id);
  const esDeOtroCliente = atencion && solicitante.rol === 'cliente' && atencion.cliente_id !== solicitante.id;

  if (!atencion || esDeOtroCliente) {
    throw new AppError(404, 'Atención no encontrada.');
  }

  atencion.imagenes = await Imagen.listarPorAtencion(id);
  return atencion;
}

async function crear(veterinario, datos) {
  const mascota = await Mascota.buscarPorId(datos.mascota_id);
  if (!mascota || !mascota.activo) {
    throw new AppError(400, 'La mascota no existe.');
  }

  // Si viene de un turno: tiene que ser de esa mascota y estar confirmado (o ya atendido)
  let turno = null;
  if (datos.turno_id) {
    turno = await Turno.buscarPorId(datos.turno_id);
    if (!turno || turno.mascota_id !== datos.mascota_id) {
      throw new AppError(400, 'El turno no existe o no corresponde a esa mascota.');
    }
    if (turno.estado === 'solicitado' || turno.estado === 'cancelado') {
      throw new AppError(409, `No se puede atender un turno que está ${turno.estado}.`);
    }
  }

  datos.veterinario_id = veterinario.id;

  let id;
  try {
    id = await Atencion.crear(datos);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'Ese turno ya tiene una atención registrada.');
    }
    throw err;
  }

  // Al registrar la atención, el turno confirmado pasa a atendido
  if (turno && turno.estado === 'confirmado') {
    await Turno.cambiarEstado(turno.id, 'atendido');
  }

  return obtener(veterinario, id);
}

// Cualquier veterinario puede corregir cualquier atención
async function actualizar(veterinario, id, datos) {
  await obtener(veterinario, id);
  await Atencion.actualizar(id, datos);
  return obtener(veterinario, id);
}

module.exports = { listar, obtener, crear, actualizar };
