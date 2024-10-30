// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Conexão com o MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/healthgate', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

// Modelo de Rota
const RouteSchema = new mongoose.Schema({
    path: { type: String, required: true },
    target: { type: String, required: true },
});
const Route = mongoose.model('Route', RouteSchema);

// Inicializando o app
const app = express();
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Endpoint para listar rotas
app.get('/api/routes', async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao carregar rotas' });
    }
});

// Endpoint para adicionar rota
app.post('/api/routes', async (req, res) => {
    const { path, target } = req.body;
    const newRoute = new Route({ path, target });
    try {
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar rota' });
    }
});

// Endpoint para deletar rota
app.delete('/api/routes/:path', async (req, res) => {
    try {
        await Route.deleteOne({ path: req.params.path });
        res.json({ message: 'Rota removida com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar rota' });
    }
});

// Definir a porta do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
