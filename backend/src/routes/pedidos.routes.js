const express = require('express');
const router = express.Router();

const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, pedidosController.crearPedido);
router.get('/historial', verificarToken, pedidosController.obtenerHistorial);

module.exports = router;