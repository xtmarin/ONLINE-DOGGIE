const express = require('express');
const router = express.Router();

const pool = require('../config/db');

router.get('/', async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT * FROM categorias
            ORDER BY id ASC
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error obteniendo categorías'
        });

    }

});

module.exports = router;