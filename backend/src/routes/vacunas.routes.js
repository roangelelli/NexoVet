const { Router } = require('express');
const controller = require('../controllers/vacunas.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();

// Ver el carnet: el personal y el dueño de la mascota (el servicio limita al cliente a lo suyo)
router.get('/', autenticar, controller.listar);

// Registrar y corregir vacunas: solo el veterinario
router.post('/', autenticar, permitirRoles('veterinario'), controller.crear);
router.put('/:id', autenticar, permitirRoles('veterinario'), controller.actualizar);

module.exports = router;
