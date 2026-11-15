const { Router } = require('express');
const controller = require('../controllers/reportes.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();

// Los reportes son solo para el personal
router.use(autenticar, permitirRoles('recepcion', 'veterinario'));

router.get('/turnos-del-dia', controller.turnosDelDia);
router.get('/vacunas-por-vencer', controller.vacunasPorVencer);

module.exports = router;
