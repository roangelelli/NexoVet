// Error con codigo HTTP, para avisar problemas esperados (datos invalidos, sin permiso, etc.)
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Punto unico donde se responde cualquier error: siempre con el formato { error: "..." }
function manejarErrores(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo del pedido no es un JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { AppError, manejarErrores };
