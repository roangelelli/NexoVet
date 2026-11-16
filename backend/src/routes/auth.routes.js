const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const autenticar = require('../middlewares/auth.middleware');
const { limiteLogin, limiteRegistro } = require('../middlewares/limites.middleware');

const router = Router();

router.post('/login', limiteLogin, controller.login);
router.post('/registro', limiteRegistro, controller.registro);
router.get('/me', autenticar, controller.me);

module.exports = router;
