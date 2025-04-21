const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.post('/routes', routeController.createRoute); 

module.exports = router;
