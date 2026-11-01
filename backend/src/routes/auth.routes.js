const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const autenticar = require('../middlewares/auth.middleware');

const router = Router();

router.post('/login', controller.login);
router.post('/registro', controller.registro);
router.get('/me', autenticar, controller.me);

module.exports = router;
