const pool = require('../config/db');

exports.crearPedido = async (req, res) => {
    const client = await pool.connect();

    try {
        const { carrito } = req.body;
        const current_user = req.usuario;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ mensaje: "Carrito vacío" });
        }

        await client.query('BEGIN');

        let total = 0;
        let productosDB = [];

        for (let item of carrito) {

            const result = await client.query(
                "SELECT * FROM productos WHERE id = $1",
                [item.id]
            );

            if (result.rows.length === 0) {
                throw new Error("Producto no existe");
            }

            const producto = result.rows[0];

            if (producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${producto.nombre}`);
            }

            const subtotal = producto.precio * item.cantidad;
            total += subtotal;

            productosDB.push({ producto, item });
        }

        const pedidoResult = await client.query(`
            INSERT INTO pedidos (usuario_id, total)
            VALUES ($1, $2)
            RETURNING id
        `, [current_user.id, total]);

        const pedido_id = pedidoResult.rows[0].id;

        for (let { producto, item } of productosDB) {

            await client.query(`
                INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio)
                VALUES ($1, $2, $3, $4)
            `, [pedido_id, producto.id, item.cantidad, producto.precio]);

            const nuevo_stock = producto.stock - item.cantidad;
            const activo = nuevo_stock > 5;

            await client.query(`
                UPDATE productos
                SET stock = $1, activo = $2
                WHERE id = $3
            `, [nuevo_stock, activo, producto.id]);
        }

        await client.query('COMMIT');

        res.json({
            mensaje: "Pedido confirmado",
            pedido_id
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ error: error.message || "Error en el pedido" });
    } finally {
        client.release();
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const result = await pool.query(`
            SELECT 
                p.id AS pedido_id,
                p.total,
                p.fecha,
                d.producto_id,
                pr.nombre,
                d.cantidad,
                d.precio
            FROM pedidos p
            JOIN detalle_pedido d ON p.id = d.pedido_id
            JOIN productos pr ON pr.id = d.producto_id
            WHERE p.usuario_id = $1
            ORDER BY p.id DESC
        `, [userId]);

        const pedidos = {};

        result.rows.forEach(row => {
            if (!pedidos[row.pedido_id]) {
                pedidos[row.pedido_id] = {
                    pedido_id: row.pedido_id,
                    total: row.total,
                    fecha: row.fecha,
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