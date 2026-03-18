const db = require("../config/db");

/* CREAR PEDIDO */

exports.crearPedido = async (req, res) => {

    try {

        const usuarioId = req.usuario.id;

        const { productos, direccion, ciudad, telefono } = req.body;

        if (!productos || productos.length === 0) {
            return res.status(400).json({ mensaje: "El carrito está vacío" });
        }

        let total = 0;

        productos.forEach(p => {
            total += p.precio * p.cantidad;
        });

        const [pedido] = await db.query(
            "INSERT INTO pedidos (usuario_id, total, direccion, ciudad, telefono) VALUES (?, ?, ?, ?, ?)",
            [usuarioId, total, direccion, ciudad, telefono]
        );

        const pedidoId = pedido.insertId;

        for (const producto of productos) {

            await db.query(
                "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
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
            mensaje: "Error creando el pedido"
        });

    }

};


/* OBTENER PEDIDOS DEL USUARIO */

exports.obtenerPedidosUsuario = async (req, res) => {

    try {

        const usuarioId = req.usuario.id;

        const [pedidos] = await db.query(
            "SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC",
            [usuarioId]
        );

        res.json(pedidos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error obteniendo pedidos"
        });

    }

};