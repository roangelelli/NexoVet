const { AppError } = require('./error.middleware');

// Uso: router.get('/ruta', autenticar, permitirRoles('recepcion', 'veterinario'), controlador)
function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new AppError(403, 'No tenés permiso para realizar esta acción.');
    }
    next();
  };
}

module.exports = permitirRoles;
