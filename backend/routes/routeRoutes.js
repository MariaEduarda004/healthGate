const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.post('/routes', routeController.createRoute); // Cadastro de rotas
router.get('/routes', routeController.getRoutes);     // Listagem de rotas
 
module.exports = router;
