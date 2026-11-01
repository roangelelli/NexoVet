const jwt = require('jsonwebtoken');
const { AppError } = require('./error.middleware');

// Exige un token valido en el header "Authorization: Bearer <token>".
// Si es valido, deja los datos del usuario en req.usuario ({ id, rol }).
function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError(401, 'Falta iniciar sesión.');
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: datos.id, rol: datos.rol };
  } catch {
    throw new AppError(401, 'La sesión expiró o no es válida.');
  }

  next();
}

module.exports = autenticar;
