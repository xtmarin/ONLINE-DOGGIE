const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productos.controller");
const { verificarToken, verificarAdmin } = require("../middleware/auth.middleware");

// obtener productos
router.get("/", productosController.obtenerProductos);

// crear producto
router.post("/", verificarToken, verificarAdmin, productosController.crearProducto);

// eliminar producto
router.delete("/:id", verificarToken, verificarAdmin, productosController.eliminarProducto);


// Actualizar producto (Editar)
router.put("/:id", verificarToken, verificarAdmin, productosController.actualizarProducto);


module.exports = router;