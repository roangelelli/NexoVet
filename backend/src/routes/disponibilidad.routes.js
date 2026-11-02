const { Router } = require('express');
const controller = require('../controllers/disponibilidad.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();
const soloPersonal = permitirRoles('recepcion', 'veterinario');

// Las franjas libres las consultan todos (el cliente las necesita para pedir turno)
router.get('/franjas', autenticar, controller.franjas);

// La configuracion la maneja solo el personal
router.get('/', autenticar, soloPersonal, controller.obtener);
router.put('/duracion', autenticar, soloPersonal, controller.actualizarDuracion);
router.post('/tramos', autenticar, soloPersonal, controller.crearTramo);
router.delete('/tramos/:id', autenticar, soloPersonal, controller.eliminarTramo);
router.post('/dias-bloqueados', autenticar, soloPersonal, controller.crearDiaBloqueado);
router.delete('/dias-bloqueados/:id', autenticar, soloPersonal, controller.eliminarDiaBloqueado);

module.exports = router;
