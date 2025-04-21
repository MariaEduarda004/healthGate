const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Criar um modelo de usuário no MongoDB
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Salvar a senha diretamente (sem hash)
        const user = new User({ username, password });
        await user.save();

        res.json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || password !== user.password) {
            return res.status(400).json({ message: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Armazena o token no cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/routes'); // Redireciona para a página de rotas após login
    } catch (err) {
        res.status(500).json({ message: 'Erro ao autenticar usuário', error: err.message });
    }
});

// Middleware para verificar autenticação
const authenticate = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.redirect('/login'); // Redireciona para a página de login se não estiver autenticado
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário ao objeto `req`
        next();
    } catch (err) {
        console.error('Erro ao verificar token:', err.message);
        return res.redirect('/login');
    }
};

module.exports = { authenticate, router };