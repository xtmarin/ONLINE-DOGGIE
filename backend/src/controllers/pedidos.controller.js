const pool = require('../config/db');

exports.crearPedido = async (req, res) => {
    const client = await pool.connect();
    let transaccionIniciada = false;

    try {
        const { carrito } = req.body;
        const current_user = req.usuario;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ mensaje: "Carrito vacío" });
        }

        await client.query('BEGIN');
        transaccionIniciada = true;

        let total = 0;
        let productosDB = [];

        // Validar existencia y stock de todos los productos en el carrito
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

        // 3. Insertar detalles y actualizar stock/estado activo de los productos
        for (let { producto, item } of productosDB) {
            await client.query(`
                INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
            `, [pedido_id, producto.id, item.cantidad, producto.precio]);

            const nuevo_stock = producto.stock - item.cantidad;
            // Desactiva automáticamente el producto si el stock queda en 5 o menos
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

    if (transaccionIniciada) {
        await client.query('ROLLBACK');
    }

    if (process.env.NODE_ENV !== 'test') {
        console.error(error);
    }

    res.status(400).json({
        error: error.message || "Error en el pedido"
    });

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
                p.estado,
                d.producto_id,
                pr.nombre,
                d.cantidad,
                d.precio_unitario AS precio
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
                    estado: row.estado,
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

/* SIMULACIÓN ENVÍO */
exports.simularEstadoEnvio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;

        if (!nuevoEstado) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        const estadoFormateado = nuevoEstado.toLowerCase();
        const estadosValidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
        
        if (!estadosValidos.includes(estadoFormateado)) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        await pool.query(
            "UPDATE pedidos SET estado = $1 WHERE id = $2",
            [estadoFormateado, id]
        );

        res.json({
            mensaje: "Estado actualizado con éxito",
            notificacion: `El pedido #${id} ahora está: ${estadoFormateado}`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};