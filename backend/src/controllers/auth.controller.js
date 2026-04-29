const pool = require('../config/db');
const { hashPassword, verifyPassword, createToken } = require('../utils/security');

exports.registro = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        const passwordHash = await hashPassword(password);

        await pool.query(
            "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
            [nombre, email, passwordHash]
        );

        res.json({ mensaje: "Usuario registrado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = rows[0];

        const valid = await verifyPassword(password, usuario.password);

        if (!valid) {
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        const token = createToken({
            id: usuario.id,
            rol: usuario.rol
        });

        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};