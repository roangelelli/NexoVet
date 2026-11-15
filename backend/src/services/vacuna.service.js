const Vacuna = require('../models/vacuna.model');
const Mascota = require('../models/mascota.model');
const Catalogo = require('../models/catalogo.model');
const mascotaService = require('./mascota.service');
const { AppError } = require('../middlewares/error.middleware');
const { ahoraArgentina, sumarDias } = require('../middlewares/validaciones');

const DIAS_AVISO = 30; // "por vencer" = vence dentro de los próximos 30 días

// vigente / por_vencer / vencida, según la próxima fecha.
// Las vacunas de dosis única (sin intervalo) no vencen.
function calcularEstado(proximaFecha) {
  if (!proximaFecha) return 'vigente';

  const hoy = ahoraArgentina().fecha;
  if (proximaFecha < hoy) return 'vencida';
  if (proximaFecha <= sumarDias(hoy, DIAS_AVISO)) return 'por_vencer';
  return 'vigente';
}

// Carnet de vacunas de una mascota (si es de otro cliente, responde 404).
// El estado se calcula solo para la última aplicación de cada vacuna:
// las anteriores ya fueron renovadas y quedan como "anterior".
async function listar(solicitante, mascotaId) {
  await mascotaService.obtener(solicitante, mascotaId);
  const vacunas = await Vacuna.listarPorMascota(mascotaId);

  const yaVistas = new Set();
  return vacunas.map((vacuna) => {
    const esUltima = !yaVistas.has(vacuna.tipo_vacuna_id);
    yaVistas.add(vacuna.tipo_vacuna_id);
    return { ...vacuna, estado: esUltima ? calcularEstado(vacuna.proxima_fecha) : 'anterior' };
  });
}

// Una vacuna con su estado (se arma desde el carnet completo)
async function obtenerConEstado(solicitante, mascotaId, id) {
  const carnet = await listar(solicitante, mascotaId);
  return carnet.find((vacuna) => vacuna.id === id);
}

async function validarTipo(tipoVacunaId) {
  if (!(await Catalogo.buscarTipoVacuna(tipoVacunaId))) {
    throw new AppError(400, 'El tipo de vacuna no existe.');
  }
}

async function crear(veterinario, datos) {
  const mascota = await Mascota.buscarPorId(datos.mascota_id);
  if (!mascota || !mascota.activo) {
    throw new AppError(400, 'La mascota no existe.');
  }
  await validarTipo(datos.tipo_vacuna_id);

  datos.veterinario_id = veterinario.id;
  const id = await Vacuna.crear(datos);
  return obtenerConEstado(veterinario, datos.mascota_id, id);
}

// Para corregir un error de carga (la mascota y el veterinario no cambian)
async function actualizar(veterinario, id, datos) {
  const vacuna = await Vacuna.buscarPorId(id);
  if (!vacuna) {
    throw new AppError(404, 'Vacuna no encontrada.');
  }
  await validarTipo(datos.tipo_vacuna_id);

  await Vacuna.actualizar(id, datos);
  return obtenerConEstado(veterinario, vacuna.mascota_id, id);
}

module.exports = { listar, crear, actualizar, calcularEstado };
