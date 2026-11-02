const { Router } = require('express');
const controller = require('../controllers/catalogos.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = Router();

// Cualquier usuario con sesion iniciada puede consultar los catalogos
router.get('/especies', autenticar, controller.especies);
router.get('/razas', autenticar, controller.razas);
router.get('/tipos-vacuna', autenticar, controller.tiposVacuna);

module.exports = router;
