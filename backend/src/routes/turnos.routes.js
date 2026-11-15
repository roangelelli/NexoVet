const { Router } = require('express');
const controller = require('../controllers/turnos.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();
const soloPersonal = permitirRoles('recepcion', 'veterinario');

// El cliente ve, pide y cancela solo lo suyo (el servicio lo controla)
router.get('/', autenticar, controller.listar);
router.post('/', autenticar, controller.crear);
router.get('/:id', autenticar, controller.obtener);
router.patch('/:id/cancelar', autenticar, controller.cancelar);

// Confirmar y atender: solo el personal
router.patch('/:id/confirmar', autenticar, soloPersonal, controller.confirmar);
router.patch('/:id/atender', autenticar, soloPersonal, controller.atender);

module.exports = router;
