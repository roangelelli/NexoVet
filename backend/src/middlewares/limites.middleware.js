const rateLimit = require('express-rate-limit');

// Límites de intentos para frenar fuerza bruta y creación masiva de cuentas.
// Se cuentan por IP y viven en memoria (alcanza para una sola instancia).
const base = {
  standardHeaders: true,
  legacyHeaders: false,
};

// Login: 10 intentos fallidos cada 15 minutos por IP.
// Los logins correctos no cuentan, así que un usuario real nunca se bloquea.
const limiteLogin = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos. Esperá unos minutos y volvé a probar.' },
});

// Registro: 10 cuentas nuevas por hora por IP.
const limiteRegistro = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { error: 'Se crearon demasiadas cuentas desde esta conexión. Probá más tarde.' },
});

module.exports = { limiteLogin, limiteRegistro };
