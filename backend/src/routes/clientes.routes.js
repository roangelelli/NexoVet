const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();
const soloPersonal = permitirRoles('recepcion', 'veterinario');

router.get('/', autenticar, soloPersonal, controller.listar);
router.post('/', autenticar, soloPersonal, controller.crear);
router.delete('/:id', autenticar, soloPersonal, controller.eliminar);

// Estas dos las usa el personal y tambien el propio cliente (el controlador lo verifica)
router.get('/:id', autenticar, controller.obtener);
router.put('/:id', autenticar, controller.actualizar);

module.exports = router;
