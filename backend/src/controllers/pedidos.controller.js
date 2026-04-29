const pool = require('../config/db');

exports.crearPedido = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { carrito } = req.body;
        const current_user = req.user;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ mensaje: "Carrito vacío" });
        }

        let total = 0;
        let productosDB = [];

        await connection.beginTransaction();

        for (let item of carrito) {

            const [rows] = await connection.query(
                "SELECT * FROM productos WHERE id = ?",
                [item.id]
            );

            if (rows.length === 0) {
                throw new Error("Producto no existe");
            }

            const producto = rows[0];

            if (producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${producto.nombre}`);
            }

            const subtotal = producto.precio * item.cantidad;
            total += subtotal;

            productosDB.push({ producto, item });
        }

        const [pedidoResult] = await connection.query(`
            INSERT INTO pedidos (usuario_id, total)
            VALUES (?, ?)
        `, [current_user.id, total]);

        const pedido_id = pedidoResult.insertId;

        for (let { producto, item } of productosDB) {

            await connection.query(`
                INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio)
                VALUES (?, ?, ?, ?)
            `, [pedido_id, producto.id, item.cantidad, producto.precio]);

            const nuevo_stock = producto.stock - item.cantidad;
            const activo = nuevo_stock > 5 ? 1 : 0;

            await connection.query(`
                UPDATE productos
                SET stock = ?, activo = ?
                WHERE id = ?
            `, [nuevo_stock, activo, producto.id]);
        }

        await connection.commit();

        res.json({
            mensaje: "Pedido confirmado",
            pedido_id
        });

    } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(400).json({ error: error.message || "Error en el pedido" });
}
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(`
            SELECT 
                p.id AS pedido_id,
                p.total,
                d.producto_id,
                pr.nombre,
                d.cantidad,
                d.precio
            FROM pedidos p
            JOIN pedido_detalle d ON p.id = d.pedido_id
            JOIN productos pr ON pr.id = d.producto_id
            WHERE p.usuario_id = ?
            ORDER BY p.id DESC
        `, [userId]);

        const pedidos = {};

        rows.forEach(row => {
            if (!pedidos[row.pedido_id]) {
                pedidos[row.pedido_id] = {
                    pedido_id: row.pedido_id,
                    total: row.total,
                    productos: []
                };
            }

            pedidos[row.pedido_id].productos.push({
                producto_id: row.producto_id,
                nombre: row.nombre,
                cantidad: row.cantidad,
                precio: row.precio
            });
        });

        res.json(Object.values(pedidos));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};