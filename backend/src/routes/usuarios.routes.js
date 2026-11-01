const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const autenticar = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/roles.middleware');

const router = Router();

router.get('/personal', autenticar, permitirRoles('recepcion', 'veterinario'), controller.listarPersonal);

module.exports = router;
