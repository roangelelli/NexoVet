const { Router } = require('express');
const controller = require('../controllers/atenciones.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();

// Ver: el personal y el dueño de la mascota (el servicio limita al cliente a lo suyo)
router.get('/', autenticar, controller.listar);
router.get('/:id', autenticar, controller.obtener);

// Cargar y editar la historia clínica: solo el veterinario
router.post('/', autenticar, permitirRoles('veterinario'), controller.crear);
router.put('/:id', autenticar, permitirRoles('veterinario'), controller.actualizar);

module.exports = router;
