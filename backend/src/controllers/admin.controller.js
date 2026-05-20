const pool = require('../config/db');

const obtenerMetricas = async (req, res) => {
    try {
        const productos = await pool.query('SELECT COUNT(*) FROM productos');
        const usuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        const ventas = await pool.query('SELECT COALESCE(SUM(total), 0) AS sum FROM pedidos');

        res.json({
            totalProductos: productos.rows[0].count,
            totalUsuarios: usuarios.rows[0].count,
            totalVentas: ventas.rows[0].sum
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener métricas" });
    }
};

const obtenerActividad = async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM actividad ORDER BY fecha DESC LIMIT 10'
        ).catch(() => ({ rows: [] }));
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener actividad" });
    }
};

const promoverUsuario = async (req, res) => {
    const { email } = req.body;
    try {
        const resultado = await pool.query(
            "UPDATE usuarios SET rol = 'admin' WHERE email = $1 RETURNING nombre",
            [email]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const nombreUsuario = resultado.rows[0].nombre;

        try {
            await pool.query(
                "INSERT INTO actividad (accion) VALUES ($1)",
                [`El usuario ${nombreUsuario} (${email}) fue promovido a Admin`]
            );
        } catch (e) {
            console.error("Error actividad:", e);
        }

        return res.json({ mensaje: `¡${nombreUsuario} ahora es Administrador!` });

    } catch (error) {
        return res.status(500).json({ mensaje: "Error al actualizar el rol" });
    }
};

/* RF40 - Obtener todos los pedidos */
const obtenerTodosPedidos = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                p.id,
                p.total,
                p.fecha,
                p.estado,
                u.nombre AS usuario_nombre,
                u.email AS usuario_email
            FROM pedidos p
            JOIN usuarios u ON u.id = p.usuario_id
            ORDER BY p.fecha DESC
        `);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener pedidos" });
    }
};

module.exports = {
    obtenerMetricas,
    obtenerActividad,
    promoverUsuario,
    obtenerTodosPedidos
};