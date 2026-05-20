const express = require('express');
const router = express.Router();

const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, pedidosController.crearPedido);
router.get('/historial', verificarToken, pedidosController.obtenerHistorial);
router.patch('/:id/estado', verificarAdmin, pedidosController.simularEstadoEnvio);

module.exports = router;