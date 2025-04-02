const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Exemplo de uma rota válida
router.post('/routes', async (req, res) => {
    try {
        const newRoute = new Route(req.body);
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar rota', error: error.message });
    }
});

module.exports = router; // Certifique-se de exportar corretamente o router
