const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verificarToken } = require("../middleware/auth.middleware");

router.post("/", verificarToken, async (req, res) => {

    console.log("Datos recibidos:", req.body);

    const usuario_id = req.usuario.id;
    const { carrito, total } = req.body;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ mensaje: "Carrito vacío" });
    }

    try {

        const [pedido] = await db.query(
            "INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)",
            [usuario_id, total]
        );

        const pedidoId = pedido.insertId;

        for (let producto of carrito) {

            await db.query(
                "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
                [pedidoId, producto.id, producto.cantidad, producto.precio]
            );

        }

        res.json({
            mensaje: "Pedido creado correctamente",
            pedidoId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error creando pedido"
        });

    }

});

module.exports = router;