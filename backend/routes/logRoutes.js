const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authenticate } = require('../routes/authRoutes'); // Protegendo a rota

router.get('/logs', authenticate, logController.listLogs);

module.exports = router;
