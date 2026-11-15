const crypto = require('crypto');
const Imagen = require('../models/imagen.model');
const Atencion = require('../models/atencion.model');
const { AppError } = require('../middlewares/error.middleware');

const CARPETA = 'nexovet/atenciones';

// Las claves de Cloudinary se cargan en el .env (nunca en el repositorio)
function leerConfiguracion() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError(503, 'Cloudinary no está configurado en el servidor.');
  }
  return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

// Firma para que el navegador suba la imagen directo a Cloudinary.
// Así el secreto nunca sale del backend y las imágenes no pasan por nuestro servidor.
function firmarSubida() {
  const { cloudName, apiKey, apiSecret } = leerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary firma los parámetros ordenados alfabéticamente + el secreto (SHA-1)
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${CARPETA}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  return { cloud_name: cloudName, api_key: apiKey, timestamp, folder: CARPETA, signature };
}

// Después de subir, el navegador nos manda la URL y la guardamos en la atención
async function agregar({ atencion_id, url, descripcion }) {
  const { cloudName } = leerConfiguracion();

  // Solo se aceptan imágenes alojadas en nuestra cuenta de Cloudinary
  if (!url.startsWith(`https://res.cloudinary.com/${cloudName}/`)) {
    throw new AppError(400, 'La URL de la imagen no es válida.');
  }
  if (!(await Atencion.buscarPorId(atencion_id))) {
    throw new AppError(404, 'Atención no encontrada.');
  }

  const id = await Imagen.crear({ atencion_id, url, descripcion });
  return Imagen.buscarPorId(id);
}

async function eliminar(id) {
  if (!(await Imagen.buscarPorId(id))) {
    throw new AppError(404, 'Imagen no encontrada.');
  }
  await Imagen.eliminar(id);
}

module.exports = { firmarSubida, agregar, eliminar };
