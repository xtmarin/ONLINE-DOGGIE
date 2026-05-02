const pool = require('../config/db');
const { hashPassword, verifyPassword, createToken } = require('../utils/security');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* ============================= */
/* CONFIGURACIÓN NODEMAILER      */
/* ============================= */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


/* ============================= */
/* RF11 - REGISTRO               */
/* ============================= */

exports.registro = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            return res.status(400).json({ mensaje: "Formato de correo inválido" });
        }

        if (password.length < 8) {
            return res.status(400).json({ mensaje: "La contraseña debe tener mínimo 8 caracteres" });
        }

        const existe = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1", [email]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        const passwordHash = await hashPassword(password);

        await pool.query(
            "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)",
            [nombre, email, passwordHash]
        );

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* RF05 - LOGIN                  */
/* ============================= */

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1", [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        const valid = await verifyPassword(password, usuario.password);
        if (!valid) {
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        /* RF34 - Si tiene 2FA activo */
        if (usuario.dos_fa_activo) {

            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const expira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

            await pool.query(
                "UPDATE usuarios SET codigo_2fa = $1, codigo_2fa_expira = $2 WHERE id = $3",
                [codigo, expira, usuario.id]
            );

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: usuario.email,
                subject: 'Código de verificación - Online Doggie',
                html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p>
                       <p>Expira en 10 minutos.</p>`
            });

            const tokenTemporal = jwt.sign(
                { id: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: '10m' }
            );

            return res.json({ requiere2FA: true, tokenTemporal });
        }

        const token = createToken({ id: usuario.id, rol: usuario.rol });

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


/* ============================= */
/* RF34 - VERIFICAR CÓDIGO 2FA   */
/* ============================= */

exports.verificar2FA = async (req, res) => {
    try {
        const { codigo, tokenTemporal } = req.body;

        if (!codigo || !tokenTemporal) {
            return res.status(400).json({ mensaje: "Datos incompletos" });
        }

        let decoded;
        try {
            decoded = jwt.verify(tokenTemporal, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ mensaje: "Token temporal expirado o inválido" });
        }

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE id = $1", [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        if (usuario.codigo_2fa !== codigo) {
            return res.status(401).json({ mensaje: "Código incorrecto" });
        }

        if (new Date() > new Date(usuario.codigo_2fa_expira)) {
            return res.status(401).json({ mensaje: "El código ha expirado" });
        }

        await pool.query(
            "UPDATE usuarios SET codigo_2fa = NULL, codigo_2fa_expira = NULL WHERE id = $1",
            [usuario.id]
        );

        const token = createToken({ id: usuario.id, rol: usuario.rol });

        res.json({
            mensaje: "Verificación exitosa",
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


/* ============================= */
/* RF12 - RECUPERAR CONTRASEÑA   */
/* ============================= */

exports.recuperarPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ mensaje: "El correo es obligatorio" });
        }

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1", [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "No existe una cuenta con ese correo" });
        }

        const usuario = result.rows[0];

        const tokenRecuperar = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperar contraseña - Online Doggie',
            html: `<p>Hola ${usuario.nombre},</p>
                   <p>Recibimos una solicitud para recuperar tu contraseña.</p>
                   <p>Tu token de recuperación es:</p>
                   <p><strong>${tokenRecuperar}</strong></p>
                   <p>Este enlace expira en 1 hora.</p>`
        });

        res.json({ mensaje: "Se envió un correo con instrucciones para recuperar tu contraseña" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* RF19 - VER PERFIL             */
/* ============================= */

exports.obtenerPerfil = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE id = $1",
            [req.usuario.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* RF19 - EDITAR PERFIL          */
/* ============================= */

exports.editarPerfil = async (req, res) => {
    try {
        const { nombre, email } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            return res.status(400).json({ mensaje: "Formato de correo inválido" });
        }

        await pool.query(
            "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3",
            [nombre, email, req.usuario.id]
        );

        res.json({ mensaje: "Perfil actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* ============================= */
/* RF20 - CAMBIAR CONTRASEÑA     */
/* ============================= */

exports.cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        if (passwordNueva.length < 8) {
            return res.status(400).json({ mensaje: "La nueva contraseña debe tener mínimo 8 caracteres" });
        }

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE id = $1", [req.usuario.id]
        );

        const usuario = result.rows[0];

        const valid = await verifyPassword(passwordActual, usuario.password);
        if (!valid) {
            return res.status(401).json({ mensaje: "La contraseña actual es incorrecta" });
        }

        const nuevaHash = await hashPassword(passwordNueva);

        await pool.query(
            "UPDATE usuarios SET password = $1 WHERE id = $2",
            [nuevaHash, req.usuario.id]
        );

        res.json({ mensaje: "Contraseña cambiada exitosamente" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};