const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.post('/routes', routeController.createRoute); 
router.get('/routes', routeController.getRoutes);    
router.delete('/routes/:id', routeController.deleteRoute);

module.exports = router;
