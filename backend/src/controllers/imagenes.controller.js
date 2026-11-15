const imagenService = require('../services/imagen.service');
const { AppError } = require('../middlewares/error.middleware');
const { esTexto, textoOpcional, leerId } = require('../middlewares/validaciones');

// Datos para subir una imagen directo a Cloudinary
async function firma(req, res) {
  res.json(imagenService.firmarSubida());
}

// Guarda la URL de una imagen ya subida
async function agregar(req, res) {
  const { atencion_id, url } = req.body || {};

  if (!Number.isInteger(atencion_id)) {
    throw new AppError(400, 'Falta indicar la atención (atencion_id).');
  }
  if (!esTexto(url, 500)) {
    throw new AppError(400, 'Falta la URL de la imagen.');
  }
  const descripcion = textoOpcional(req.body.descripcion, 255, 'La descripción');

  res.status(201).json({ imagen: await imagenService.agregar({ atencion_id, url: url.trim(), descripcion }) });
}

async function eliminar(req, res) {
  await imagenService.eliminar(leerId(req.params.id));
  res.json({ mensaje: 'Imagen eliminada.' });
}

module.exports = { firma, agregar, eliminar };
