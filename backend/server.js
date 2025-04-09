const express = require('express');
const mongoose = require('mongoose');
const Route = require('./models/Route');
const axios = require('axios');
const https = require('https');
const { pathToRegexp, match } = require('path-to-regexp');
const routeRoutes = require('./routes/routeRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/healthgate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado')).catch(err => console.error(err));

app.use('/api/admin', routeRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    if (req.method === 'PUT') {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
                console.log("Corpo da requisição recebido:", req.body);
                next();
            } catch (e) {
                res.status(400).send("Erro ao parsear o JSON.");
            }
        });
    } else {
        next();
    }
});

let fassECGToken = null;
let fassECGTokenExpiry = null;

async function getAccessTokenForFassECG() {
    const now = Date.now();
    if (fassECGToken && fassECGTokenExpiry && now < fassECGTokenExpiry) {
        return fassECGToken;
    }

    try {
        const tokenResponse = await axios.post('http://localhost:8080/auth/token', {
            client_id: '67eacf0237bd52430adc8f4d',
            code: 'codigo pre definifo'
        });

        const token = tokenResponse.data.access_token;

        fassECGToken = token;
        fassECGTokenExpiry = now + (tokenResponse.data.expires_in * 1000) - 5000; // 5 segundos antes do expirar
        return fassECGToken;
    } catch (error) {
        console.error('Erro na obtenção do token:', error);
        throw new Error('Falha na autenticação');
    }
}


async function handleRequest(req, res, projectName) {
    try {
        const routes = await Route.find({ method: req.method, nameProject: projectName });
        if (!routes.length) {
            return res.status(404).json({ message: 'Nenhuma rota encontrada para o projeto' });
        }

        routes.sort((a, b) => {
            const countParams = (path) => (path.match(/{[^}]+}/g) || []).length;
            return countParams(a.sourcePath) - countParams(b.sourcePath) || a.sourcePath.localeCompare(b.sourcePath);
        });

        let matchingRoute = null;
        let params = {};

        // for (const route of routes) {
        //     const matcher = match(route.sourcePath, { decode: decodeURIComponent });
        //     const matchResult = matcher(req.path);
        //     if (matchResult) {
        //         matchingRoute = route;
        //         params = matchResult.params;
        //         break;
        //     }
        // }

        for (const route of routes) {
          console.log("Testando rota:", route.sourcePath);
          
          const routeRegex = pathToRegexp(route.sourcePath);
          const matcher = match(route.sourcePath, { decode: decodeURIComponent });
          const matchResult = matcher(req.path);

          console.log("Resultado do match para", route.sourcePath, ":", matchResult);

          if (matchResult) {
              matchingRoute = route;
              params = matchResult.params;
              break;
          }
        }

        if (!matchingRoute) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        let targetUrl = matchingRoute.targetUrl;
        Object.keys(params).forEach(param => {
            targetUrl = targetUrl.replace(`:${param}`, params[param]);
        });

        const queryParams = new URLSearchParams(req.query).toString();
        if (queryParams) targetUrl += `?${queryParams}`;

        let headers = {
            'content-type': 'application/json',
            'accept': 'application/json'
        };

        if (projectName === "FASS_ECG" && matchingRoute.method === 'PATCH') {
            headers = {
                'content-type': 'application/json-patch+json',
                'accept': 'application/json-patch+json'
            };
        } else if (projectName === "FASS_ECG" && matchingRoute.method === 'PUT') {
            headers = {
                'content-type': 'application/fhir+json',
                'accept': 'application/fhir+json'
            };
        }

        if (projectName === "FASS_ECG") {
            headers['Authorization'] = `Bearer ${await getAccessTokenForFassECG()}`;
        }

        const agent = new https.Agent({ rejectUnauthorized: false });

        console.log("Redirecionando para:", targetUrl);
        console.log("Método:", matchingRoute.method);
        console.log("Cabeçalhos:", headers);
        console.log("Corpo da requisição:", req.body);

        const response = await axios({
            method: matchingRoute.method,
            url: targetUrl,
            headers: headers,
            data: Object.keys(req.body).length ? req.body : undefined,
            httpsAgent: agent
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Erro ao redirecionar a requisição:', error);
        res.status(500).json({ message: 'Erro ao redirecionar a requisição', error: error.message });
    }
}

app.use('/api/fassecg',  (req, res) => handleRequest(req, res, "FASS_ECG"));
app.use('/api/ifcloud',  (req, res) => handleRequest(req, res, "IF_CLOUD"));
app.use('/api/neoFassEcg',  (req, res) => handleRequest(req, res, "neoFassEcg"));
app.listen(3001, () => console.log('Servidor rodando na porta 3001'));
