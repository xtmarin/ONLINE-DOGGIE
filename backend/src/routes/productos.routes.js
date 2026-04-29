const express = require('express');
const router = express.Router();

const productosController = require('../controllers/productos.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

router.get('/', productosController.obtenerProductos);

router.post('/', verificarAdmin, productosController.crearProducto);
router.delete('/:id', verificarAdmin, productosController.eliminarProducto);
router.put('/:id', verificarAdmin, productosController.actualizarProducto);

module.exports = router;