const pool = require('../config/db');


const obtenerMetricas = async (req, res) => {
    try {
        const productos = await pool.query('SELECT COUNT(*) FROM productos');
        const usuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        
       
        const ventas = await pool.query('SELECT SUM(total) FROM ventas').catch(() => ({ rows: [{ sum: 0 }] }));

        res.json({
            totalProductos: productos.rows[0].count,
            totalUsuarios: usuarios.rows[0].count,
            totalVentas: ventas.rows[0].sum || 0
        });
    } catch (error) {
        console.error("Error en métricas:", error);
        res.status(500).json({ mensaje: "Error al obtener métricas" });
    }
};


const obtenerActividad = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM actividad ORDER BY fecha DESC LIMIT 10').catch(() => ({ rows: [] }));
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error en actividad:", error);
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
            return res.status(404).json({ mensaje: "Usuario no encontrado en el sistema" });
        }

        const nombreUsuario = resultado.rows[0].nombre;

       
        try {
            await pool.query(
                "INSERT INTO actividad (accion) VALUES ($1)",
                [`El usuario ${nombreUsuario} (${email}) fue promovido a Admin`]
            );
        } catch (actividadError) {
            // Si la tabla de actividad falla por alguna columna, el servidor no se cae
            console.error("Error al guardar en la tabla actividad:", actividadError);
        }

    
        return res.json({ mensaje: `¡${nombreUsuario} ahora es Administrador!` });

    } catch (error) {
        console.error("Error principal en promoverUsuario:", error);
        return res.status(500).json({ mensaje: "Error al actualizar el rol en la base de datos" });
    }
};


module.exports = {
    obtenerMetricas,
    obtenerActividad,
    promoverUsuario 
};