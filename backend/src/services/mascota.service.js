const Mascota = require('../models/mascota.model');
const Catalogo = require('../models/catalogo.model');
const Usuario = require('../models/usuario.model');
const { AppError } = require('../middlewares/error.middleware');

// Un cliente ve solo sus mascotas; el personal ve todas
function listar(solicitante, { clienteId, buscar }) {
  if (solicitante.rol === 'cliente') clienteId = solicitante.id;
  return Mascota.listar({ clienteId, buscar });
}

async function obtener(solicitante, id) {
  const mascota = await Mascota.buscarPorId(id);
  const esDeOtroCliente = mascota && solicitante.rol === 'cliente' && mascota.cliente_id !== solicitante.id;

  // Si es de otro cliente respondemos "no encontrada", igual que si no existiera
  if (!mascota || esDeOtroCliente) {
    throw new AppError(404, 'Mascota no encontrada.');
  }
  return mascota;
}

// Reglas de especie y raza (necesitan consultar la base)
async function validarEspecieYRaza(datos) {
  const especie = await Catalogo.buscarEspecie(datos.especie_id);
  if (!especie) {
    throw new AppError(400, 'La especie no existe.');
  }

  if (especie.nombre === 'Otro') {
    // "Otro" exige aclarar la especie y no tiene razas
    if (!datos.especie_otra) {
      throw new AppError(400, 'Indicá cuál es la especie.');
    }
    datos.raza_id = null;
  } else {
    datos.especie_otra = null;
  }

  if (datos.raza_id) {
    const raza = await Catalogo.buscarRaza(datos.raza_id);
    if (!raza || raza.especie_id !== datos.especie_id) {
      throw new AppError(400, 'La raza no corresponde a la especie elegida.');
    }
  }
}

// El microchip no se puede repetir (lo garantiza la base de datos)
async function guardar(accion) {
  try {
    return await accion();
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'Ya existe una mascota con ese microchip.');
    }
    throw err;
  }
}

async function crear(solicitante, datos) {
  if (solicitante.rol === 'cliente') {
    datos.cliente_id = solicitante.id;
  } else {
    const cliente = await Usuario.buscarPorId(datos.cliente_id);
    if (!cliente || cliente.rol !== 'cliente' || !cliente.activo) {
      throw new AppError(400, 'El cliente no existe.');
    }
  }

  await validarEspecieYRaza(datos);
  const id = await guardar(() => Mascota.crear(datos));
  return Mascota.buscarPorId(id);
}

async function actualizar(solicitante, id, datos) {
  await obtener(solicitante, id);
  await validarEspecieYRaza(datos);
  await guardar(() => Mascota.actualizar(id, datos));
  return Mascota.buscarPorId(id);
}

async function darDeBaja(solicitante, id) {
  await obtener(solicitante, id);
  await Mascota.darDeBaja(id);
}

module.exports = { listar, obtener, crear, actualizar, darDeBaja };
