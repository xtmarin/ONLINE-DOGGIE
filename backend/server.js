const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db=require('./config/db');
const authRoutes = require('./routes/auth.routes');
const { verificarToken, verificarAdmin } = require('./middleware/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

db.getConnection()
    .then(connection => {
        console.log("✅ Conectado a MySQL correctamente");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Error conectando a MySQL:", err);
    });

app.get("/", (req, res) => {
    res.send("API Online Doggie funcionando 🐶");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

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

app.get("/api/productos", async (req, res) => {
    try {
        const [productos] = await db.query("SELECT * FROM productos");
        res.json(productos);
    } catch (error) {
        console.error("ERROR REAL:", error);
        res.status(500).json({ 
            mensaje: "Error obteniendo productos",
            error: error.message
        });
    }
});