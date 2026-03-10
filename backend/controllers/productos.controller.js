const db = require("../config/db");

// obtener productos
exports.obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query("SELECT * FROM productos");
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error obteniendo productos" });
    }
};

// crear producto
exports.crearProducto = async (req, res) => {

    try {

        const { nombre, descripcion, precio, categoria, imagen, stock } = req.body;

        await db.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, stock) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, descripcion, precio, categoria, imagen, stock]
        );

        res.json({ mensaje: "Producto creado correctamente" });

    } catch (error) {

        res.status(500).json({ mensaje: "Error creando producto" });

    }
};

// eliminar producto
exports.eliminarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query("DELETE FROM productos WHERE id = ?", [id]);

        res.json({ mensaje: "Producto eliminado" });

    } catch (error) {

        res.status(500).json({ mensaje: "Error eliminando producto" });

    }
};

exports.actualizarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        const { nombre, descripcion, precio, categoria, imagen, stock } = req.body;

        await db.query(
            `UPDATE productos 
             SET nombre=?, descripcion=?, precio=?, categoria=?, imagen=?, stock=?
             WHERE id=?`,
            [nombre, descripcion, precio, categoria, imagen, stock, id]
        );

        res.json({ mensaje: "Producto actualizado correctamente" });

    } catch (error) {

        console.error(error);

        res.status(500).json({ mensaje: "Error actualizando producto" });

    }

};