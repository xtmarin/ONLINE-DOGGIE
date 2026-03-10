const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const db = require('./config/db');

// rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const pedidosRoutes = require('./routes/pedidos.routes');

// middleware de autenticación
const { verificarToken, verificarAdmin } = require('./middleware/auth.middleware');

const app = express();

/* ============================= */
/* MIDDLEWARES */
/* ============================= */

app.use(cors());
app.use(express.json());

/* ============================= */
/* SERVIR FRONTEND */
/* ============================= */

// Servir todo el frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir imágenes
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

/* ============================= */
/* RUTAS API */
/* ============================= */

// autenticación
app.use('/api/auth', authRoutes);

// productos
app.use('/api/productos', productosRoutes);

// pedidos
app.use('/api/pedidos', pedidosRoutes);

/* ============================= */
/* CONEXIÓN A MYSQL */
/* ============================= */

db.getConnection()
    .then(connection => {
        console.log("✅ Conectado a MySQL correctamente");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Error conectando a MySQL:", err);
    });

/* ============================= */
/* RUTA BASE */
/* ============================= */

app.get("/", (req, res) => {
    res.send("API Online Doggie funcionando 🐶");
});

/* ============================= */
/* RUTAS PROTEGIDAS DE PRUEBA */
/* ============================= */

app.get("/api/protegido", verificarToken, (req, res) => {
    res.json({
        mensaje: "Accediste a una ruta protegida",
        usuario: req.usuario
    });
});

app.get("/api/admin", verificarToken, verificarAdmin, (req, res) => {
    res.json({
        mensaje: "Bienvenido administrador",
        usuario: req.usuario
    });
});

/* ============================= */
/* SERVIDOR */
/* ============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});