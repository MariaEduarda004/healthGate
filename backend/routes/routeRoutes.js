const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authUniversal = require('../middlewares/authUniversal');

router.use(authUniversal); // protege tudo abaixo

router.post('/routes', routeController.createRoute); 
router.get('/routes', routeController.getRoutes);    
router.delete('/routes/:id', routeController.deleteRoute);

module.exports = router;
