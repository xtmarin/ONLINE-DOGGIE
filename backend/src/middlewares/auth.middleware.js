const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ mensaje: "Token requerido" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido" });
    }
};

const verificarAdmin = (req, res, next) => {
    verificarToken(req, res, () => {
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ mensaje: "No autorizado" });
        }
        next();
    });
};

module.exports = {
    verificarToken,
    verificarAdmin
};