const jwt = require("jsonwebtoken");

exports.verificarToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado, token requerido" });
    }

    try {
        const tokenLimpio = token.replace("Bearer ", "");
        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

        req.usuario = decoded; // Guardamos info del usuario
        next();

    } catch (error) {
        return res.status(403).json({ mensaje: "Token inválido" });
    }
};

exports.verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({ mensaje: "Acceso solo para administradores" });
    }
    next();
};