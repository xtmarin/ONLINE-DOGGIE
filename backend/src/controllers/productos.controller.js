const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

/* ============================= */
/* CONFIGURACIÓN MULTER          */
/* ============================= */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../frontend/assets/img'));
    },
    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + '-' + file.originalname;
        cb(null, nombreUnico);
    }
});

exports.upload = multer({ storage });


/* ============================= */
/* OBTENER PRODUCTOS             */
/* ============================= */

exports.obtenerProductos = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM productos WHERE activo = TRUE"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* CREAR PRODUCTO                */
/* ============================= */

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria, stock } = req.body;

        if (!nombre || !descripcion || !precio || !categoria || !stock) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const imagen = req.file ? req.file.filename : null;

        await pool.query(`
            INSERT INTO productos (nombre, descripcion, precio, categoria, stock, imagen)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [nombre, descripcion, precio, categoria, stock, imagen]);

        res.json({ mensaje: "Producto creado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* ACTUALIZAR PRODUCTO           */
/* ============================= */

exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria, stock } = req.body;

        if (!nombre || !descripcion || !precio || !categoria || !stock) {
            return res.status(400).json({ error: "No se permiten campos vacíos" });
        }

        const imagen = req.file ? req.file.filename : null;

        if (imagen) {
            await pool.query(`
                UPDATE productos 
                SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, stock=$5, imagen=$6
                WHERE id=$7
            `, [nombre, descripcion, precio, categoria, stock, imagen, id]);
        } else {
            await pool.query(`
                UPDATE productos 
                SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, stock=$5
                WHERE id=$6
            `, [nombre, descripcion, precio, categoria, stock, id]);
        }

        res.json({ mensaje: "Producto actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* ELIMINAR PRODUCTO             */
/* ============================= */

exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "UPDATE productos SET activo = FALSE WHERE id = $1",
            [id]
        );

        res.json({ mensaje: "Producto eliminado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* STOCK BAJO (RF02)             */
/* ============================= */

exports.stockBajo = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, nombre, stock FROM productos WHERE stock <= 5 AND activo = TRUE"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* ACTUALIZAR STOCK (RF26+RF27)  */
/* ============================= */

exports.actualizarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock === null) {
            return res.status(400).json({ error: "El stock es obligatorio" });
        }

        const nuevoActivo = stock > 5;

        await pool.query(`
            UPDATE productos 
            SET stock=$1, activo=$2
            WHERE id=$3
        `, [stock, nuevoActivo, id]);

        res.json({ 
            mensaje: nuevoActivo 
                ? "Stock actualizado correctamente" 
                : "Stock actualizado. Producto desactivado por stock bajo."
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* VALORAR PRODUCTO (RF23)       */
/* ============================= */

exports.valorarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { valoracion } = req.body;
        const usuario_id = req.usuario.id;

        if (!valoracion || valoracion < 1 || valoracion > 5) {
            return res.status(400).json({ error: "La valoración debe ser entre 1 y 5" });
        }

        const yaValoro = await pool.query(
            "SELECT id FROM valoraciones WHERE producto_id=$1 AND usuario_id=$2",
            [id, usuario_id]
        );

        if (yaValoro.rows.length > 0) {
            return res.status(400).json({ error: "Ya valoraste este producto" });
        }

        await pool.query(`
            INSERT INTO valoraciones (producto_id, usuario_id, valoracion)
            VALUES ($1, $2, $3)
        `, [id, usuario_id, valoracion]);

        res.json({ mensaje: "Valoración registrada" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* OBTENER VALORACIÓN PROMEDIO   */
/* ============================= */

exports.obtenerValoracion = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT ROUND(AVG(valoracion), 1) as promedio, COUNT(*) as total FROM valoraciones WHERE producto_id=$1",
            [id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};