require('dotenv').config();
const adminRoutes = require('./routes/admin.routes');
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const pedidosRoutes = require('./routes/pedidos.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/assets/img', express.static(path.join(__dirname, '../../frontend/assets/img')));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API ONLINE DOGGIE funcionando 🐶');
});

module.exports = app;