const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.registrar = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        const [usuarioExistente] = await db.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // Insertar usuario
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

const jwt = require("jsonwebtoken");

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