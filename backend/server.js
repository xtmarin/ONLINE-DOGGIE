const app = require('./src/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server corriendo en http://localhost:${PORT}`);
});

const pool = require('./src/config/db');

pool.query('SELECT NOW()', (err, res) => {
    console.log('Conexión a la base de datos establecida');
});