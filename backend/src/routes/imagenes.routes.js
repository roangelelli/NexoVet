const { Router } = require('express');
const controller = require('../controllers/imagenes.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();
const soloVeterinario = permitirRoles('veterinario');

// Las imágenes se ven dentro de cada atención (GET /api/atenciones/:id).
// Adjuntar y quitar: solo el veterinario.
router.get('/firma', autenticar, soloVeterinario, controller.firma);
router.post('/', autenticar, soloVeterinario, controller.agregar);
router.delete('/:id', autenticar, soloVeterinario, controller.eliminar);

module.exports = router;
