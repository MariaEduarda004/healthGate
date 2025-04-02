const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Criar um modelo de usuário no MongoDB
require('dotenv').config();

const router = express.Router();

// Registrar usuário
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: err.message });
    }
});

// Login do usuário
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuário ou senha inválidos' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Usuário ou senha inválidos' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao autenticar usuário', error: err.message });
    }
});

module.exports = router;
