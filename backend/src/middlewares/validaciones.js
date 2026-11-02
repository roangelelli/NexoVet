const { AppError } = require('./error.middleware');

// Texto obligatorio: no vacio y de hasta "max" caracteres
function esTexto(valor, max = 255) {
  return typeof valor === 'string' && valor.trim() !== '' && valor.trim().length <= max;
}

// Texto opcional: devuelve el texto limpio, o null si no vino
function textoOpcional(valor, max, campo) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string' || valor.trim().length > max) {
    throw new AppError(400, `${campo} no es válido (máximo ${max} caracteres).`);
  }
  return valor.trim();
}

// Fecha con formato AAAA-MM-DD y que exista de verdad (no acepta 2026-02-30)
function esFecha(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(valor + 'T00:00:00Z');
  return !isNaN(fecha) && fecha.toISOString().slice(0, 10) === valor;
}

// Hora con formato HH:MM
function esHora(valor) {
  return typeof valor === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

// Convierte un id de la URL en numero, o avisa que no es valido
function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, 'El id no es válido.');
  }
  return id;
}

// Fecha y hora actuales en Argentina (el servidor en la nube usa hora UTC)
function ahoraArgentina() {
  const texto = new Date().toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
  return { fecha: texto.slice(0, 10), hora: texto.slice(11, 16) };
}

// Datos para dar de alta un cliente (los usa el autorregistro y el alta por el personal)
function validarNuevoCliente(body = {}) {
  const { nombre, apellido, email, password } = body;

  if (!esTexto(nombre, 80) || !esTexto(apellido, 80)) {
    throw new AppError(400, 'Nombre y apellido son obligatorios.');
  }
  if (!esTexto(email, 150) || !email.includes('@')) {
    throw new AppError(400, 'El email no es válido.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  textoOpcional(body.telefono, 30, 'El teléfono');
}

module.exports = { esTexto, textoOpcional, esFecha, esHora, leerId, ahoraArgentina, validarNuevoCliente };
