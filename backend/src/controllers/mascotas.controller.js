const mascotaService = require('../services/mascota.service');
const { AppError } = require('../middlewares/error.middleware');
const { esTexto, textoOpcional, esFecha, leerId, ahoraArgentina } = require('../middlewares/validaciones');

// Valida el formato de los datos de una mascota (alta y modificacion usan los mismos)
function leerDatos(body = {}) {
  const { nombre, especie_id, raza_id, sexo, fecha_nacimiento, esterilizado } = body;

  if (!esTexto(nombre, 80)) {
    throw new AppError(400, 'El nombre es obligatorio (máximo 80 caracteres).');
  }
  if (!Number.isInteger(especie_id)) {
    throw new AppError(400, 'La especie es obligatoria.');
  }
  if (raza_id !== undefined && raza_id !== null && !Number.isInteger(raza_id)) {
    throw new AppError(400, 'La raza no es válida.');
  }
  if (sexo !== 'macho' && sexo !== 'hembra') {
    throw new AppError(400, 'El sexo debe ser "macho" o "hembra".');
  }
  if (fecha_nacimiento !== undefined && fecha_nacimiento !== null) {
    if (!esFecha(fecha_nacimiento) || fecha_nacimiento > ahoraArgentina().fecha) {
      throw new AppError(400, 'La fecha de nacimiento no es válida (formato AAAA-MM-DD, no puede ser futura).');
    }
  }
  if (esterilizado !== undefined && typeof esterilizado !== 'boolean') {
    throw new AppError(400, 'Esterilizado debe ser verdadero o falso.');
  }

  return {
    nombre: nombre.trim(),
    especie_id,
    raza_id: raza_id || null,
    especie_otra: textoOpcional(body.especie_otra, 80, 'La especie'),
    sexo,
    fecha_nacimiento: fecha_nacimiento || null,
    microchip: textoOpcional(body.microchip, 50, 'El microchip'),
    color: textoOpcional(body.color, 50, 'El color'),
    esterilizado: esterilizado === true,
  };
}

async function listar(req, res) {
  const buscar = typeof req.query.buscar === 'string' ? req.query.buscar.trim() : '';
  const clienteId = req.query.cliente_id ? leerId(req.query.cliente_id) : null;
  res.json({ mascotas: await mascotaService.listar(req.usuario, { clienteId, buscar }) });
}

async function obtener(req, res) {
  res.json({ mascota: await mascotaService.obtener(req.usuario, leerId(req.params.id)) });
}

async function crear(req, res) {
  const datos = leerDatos(req.body);

  // El personal indica de que cliente es la mascota; un cliente siempre la crea para si mismo
  if (req.usuario.rol !== 'cliente') {
    datos.cliente_id = req.body.cliente_id;
    if (!Number.isInteger(datos.cliente_id)) {
      throw new AppError(400, 'Falta indicar el cliente (cliente_id).');
    }
  }

  res.status(201).json({ mascota: await mascotaService.crear(req.usuario, datos) });
}

async function actualizar(req, res) {
  const id = leerId(req.params.id);
  res.json({ mascota: await mascotaService.actualizar(req.usuario, id, leerDatos(req.body)) });
}

async function eliminar(req, res) {
  await mascotaService.darDeBaja(req.usuario, leerId(req.params.id));
  res.json({ mensaje: 'Mascota dada de baja.' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
