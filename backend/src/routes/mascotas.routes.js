const { Router } = require('express');
const controller = require('../controllers/mascotas.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = Router();

// Las usan el personal y los clientes; el servicio limita al cliente a sus propias mascotas
router.get('/', autenticar, controller.listar);
router.post('/', autenticar, controller.crear);
router.get('/:id', autenticar, controller.obtener);
router.put('/:id', autenticar, controller.actualizar);
router.delete('/:id', autenticar, controller.eliminar);

module.exports = router;
