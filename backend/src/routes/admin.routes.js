const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller'); 

router.get('/metricas', adminCtrl.obtenerMetricas);
router.get('/actividad', adminCtrl.obtenerActividad);
router.post('/nuevo-admin', adminCtrl.promoverUsuario);

module.exports = router;