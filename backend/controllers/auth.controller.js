const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* REGISTRO */

exports.registrar = async (req, res) => {
    try {

        const { nombre, email, password } = req.body;

        const [usuarioExistente] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        await db.query(
            "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
            [nombre, email, passwordEncriptada]
        );

        res.status(201).json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};


/* LOGIN */

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const [usuario] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuario.length === 0) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }

        const usuarioData = usuario[0];

        const passwordValida = await bcrypt.compare(
            password,
            usuarioData.password
        );

        if (!passwordValida) {
            return res.status(400).json({ mensaje: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            {
                id: usuarioData.id,
                rol: usuarioData.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuarioData.id,
                nombre: usuarioData.nombre,
                rol: usuarioData.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};


/* PERFIL */

exports.perfil = async (req, res) => {
    try {

        const [usuario] = await db.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
            [req.usuario.id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json(usuario[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};