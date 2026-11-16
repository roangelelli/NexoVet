const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const mascotasRoutes = require('./routes/mascotas.routes');
const disponibilidadRoutes = require('./routes/disponibilidad.routes');
const turnosRoutes = require('./routes/turnos.routes');
const atencionesRoutes = require('./routes/atenciones.routes');
const imagenesRoutes = require('./routes/imagenes.routes');
const vacunasRoutes = require('./routes/vacunas.routes');
const reportesRoutes = require('./routes/reportes.routes');
const { manejarErrores } = require('./middlewares/error.middleware');

const app = express();

// Render pone un proxy delante: sin esto el límite de intentos vería siempre la misma IP.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/atenciones', atencionesRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/vacunas', vacunasRoutes);
app.use('/api/reportes', reportesRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(manejarErrores);

module.exports = app;
