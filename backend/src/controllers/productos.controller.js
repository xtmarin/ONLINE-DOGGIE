const pool = require('../config/db');

exports.obtenerProductos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM productos WHERE activo = TRUE"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria, stock } = req.body;

        await pool.query(`
            INSERT INTO productos (nombre, descripcion, precio, categoria, stock)
            VALUES (?, ?, ?, ?, ?)
        `, [nombre, descripcion, precio, categoria, stock]);

        res.json({ mensaje: "Producto creado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "UPDATE productos SET activo = FALSE WHERE id = ?",
            [id]
        );

        res.json({ mensaje: "Producto eliminado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria, stock } = req.body;

        await pool.query(`
            UPDATE productos 
            SET nombre=?, descripcion=?, precio=?, categoria=?, stock=?
            WHERE id=?
        `, [nombre, descripcion, precio, categoria, stock, id]);

        res.json({ mensaje: "Producto actualizado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};