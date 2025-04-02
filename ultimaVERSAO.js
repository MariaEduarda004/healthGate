const express = require('express');
const mongoose = require('mongoose');
const Route = require('./models/Route');
const axios = require('axios');
const https = require('https');
const routeRoutes = require('./routes/routeRoutes');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/healthgate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado')).catch(err => console.error(err));

app.use('/api/admin', routeRoutes);


function matchRoute(url, pattern, method) {
    let tam = 8;
    // if (method === 'GET') {
    //     tam = 24;
    // }
    const regexPattern = pattern
        .replace(/{id}/g, '([a-fA-F0-9]{'+tam+'})') // Para um ID de 8 caracteres hexadecimais
        .replace(/{minute}/g, '(\\d+)')
        .replace(/{start}/g, '(\\d+)')
        .replace(/{end}/g, '(\\d+)'); 
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    return regex.test(url);//verifica se a url combina com o padrão
}

app.use('/api/fassecg/', (req, res, next) => {//tratativa nas requisições put do fassecg, conversao do corpo json nao estava funcionando
    if (req.method === 'PUT') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
                console.log("Corpo da requisição recebido no middleware:", req.body);
                next();
            } catch (e) {
                res.status(400).send("Erro ao parsear o JSON.");
            }
        });
    } else {
        next();
    }
});

app.use('/api/fassecg/', async (req, res) => {
    try {
        const routes = await Route.find({ 
            method: req.method, 
            nameProject: "FASS_ECG" 
        });
        console.log("Rotas encontradas:", routes);
        //Conta e ordena as rotas pela quantidade de parâmetros (e pelo caminho)
        //rotas com menos parametros bem prioridade
        //ordernado por ordem alfabética
        routes.sort((a, b) => {
            const countParams = (path) => (path.match(/{[^}]+}/g) || []).length;
            return countParams(a.sourcePath) - countParams(b.sourcePath) || a.sourcePath.localeCompare(b.sourcePath);
        });

        let matchingRoute = null;
        let params = {};

        // Itera sobre as rotas para encontrar uma correspondência
        for (const route of routes) {
            console.log("Tentando combinar:", route.sourcePath, "com", req.path);

            // usando matchRoute para comparar as rotas e metodo
            if (matchRoute(req.path, route.sourcePath, req.method)) {
                matchingRoute = route;
                
                // extraindo parâmetros da URL a partir do regex
                const matchResult = req.path.match(new RegExp(route.sourcePath.replace(/{[^}]+}/g, '([^/]+)')));
                if (matchResult) {
                    //mapeia os placeholder do sourcepath para os valores extraidos
                    params = route.sourcePath.match(/{([^}]+)}/g)?.reduce((acc, param, index) => {
                        if (matchResult[index + 1]) {
                            acc[param.replace(/[{}]/g, '')] = matchResult[index + 1];
                        }
                        return acc;
                    }, {}) || {}; 
                }

                console.log("Rota encontrada:", matchingRoute);
                console.log("Parâmetros extraídos da URL:", params);

                // Adiciona parâmetros do corpo da requisição ao objeto params
                if (req.body && Object.keys(req.body).length > 0) {
                    Object.keys(req.body).forEach((key) => {
                        if (route.sourcePath.includes(`{${key}}`)) {
                            params[key] = req.body[key]; 
                        }
                    });
                }

                console.log("Parâmetros finais (da URL e do corpo):", params);
                break;

            }
        }

        if (!matchingRoute) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        let targetUrl = matchingRoute.targetUrl;

        // Substitui parâmetros na URL de destino
        Object.keys(params).forEach((param) => {
            targetUrl = targetUrl.replace(`{${param}}`, params[param]);
        });

        const queryParams = new URLSearchParams(req.query).toString();
        if (queryParams) {
            targetUrl += `?${queryParams}`;
        }

        let headers = {
            'content-type': 'application/fhir+json',
            'accept': 'application/fhir+json'
        };

        if(matchingRoute.method == 'PATCH'){
             headers = {
                'content-type': 'application/json-patch+json',
                'accept': 'application/json-patch+json'
              };
        }
        
        const agent = new https.Agent({ rejectUnauthorized: false });

        console.log("Método:", matchingRoute.method);
        console.log("URL de destino:", targetUrl);
        console.log("Cabeçalhos:", headers);
        console.log("Corpo da requisição recebido:", req.body);

        
        const response = await axios({
            method: matchingRoute.method,
            url: targetUrl,
            headers: headers,
            data: Object.keys(req.body).length ? req.body : undefined, // Só envia req.body se não estiver vazio
            httpsAgent: agent
        });
        
        
        // console.log("Status da resposta:", response.status);
        // console.log("Dados da resposta:", response.data);
        
        res.status(response.status).json(response.data);
        
    } catch (error) {
        console.error('Erro ao redirecionar a requisição:', error);
        res.status(500).json({ message: 'Erro ao redirecionar a requisição', error: error.message });
    }
});
app.use('/api/ifcloud/', async (req, res) => {
    try {
        const routes = await Route.find({
            method: req.method,
            nameProject: "IF_CLOUD"
        });
        console.log("Rotas encontradas:", routes);

        // Ordena as rotas pela quantidade de parâmetros
        routes.sort((a, b) => {
            const countParams = (path) => (path.match(/(?:{[^}]+}|:[^/]+)/g) || []).length;
            return countParams(a.sourcePath) - countParams(b.sourcePath) || a.sourcePath.localeCompare(b.sourcePath);
        });

        let matchingRoute = null;
        let params = {};

        // Função para verificar correspondência da rota
        const matchRoute = (reqPath, routePath) => {
            const routeRegex = new RegExp(
                '^' + routePath.replace(/{[^}]+}/g, '([^/]+)').replace(/:([^/]+)/g, '([^/]+)') + '$'
            );
            return routeRegex.test(reqPath);
        };

        // Itera sobre as rotas para encontrar uma correspondência
        for (const route of routes) {
            console.log("Tentando combinar:", route.sourcePath, "com", req.path);

            if (matchRoute(req.path, route.sourcePath)) {
                matchingRoute = route;

                // Extraindo parâmetros da URL
                const matchResult = req.path.match(
                    new RegExp(
                        '^' + route.sourcePath
                            .replace(/{[^}]+}/g, '([^/]+)')
                            .replace(/:([^/]+)/g, '([^/]+)') + '$'
                    )
                );

                if (matchResult) { 
                    params = route.sourcePath.match(/(?:{([^}]+)}|:([^/]+))/g)?.reduce((acc, param, index) => {
                        const paramName = param.replace(/[{}/:]/g, ''); // Remove `{}`, `/`, e `:`
                        if (matchResult[index + 1]) {
                            acc[paramName] = matchResult[index + 1];
                        }
                        return acc;
                    }, {}) || {}; // Previne erro se matchResult não fornecer correspondência
                }

                console.log("Rota encontrada:", matchingRoute);
                console.log("Parâmetros extraídos da URL:", params);

                // Adiciona parâmetros do corpo da requisição ao objeto params
                if (req.body && Object.keys(req.body).length > 0) {
                    Object.keys(req.body).forEach((key) => {
                        if (route.sourcePath.includes(`{${key}}`)) {
                            params[key] = req.body[key];
                        }
                    });
                }

                console.log("Parâmetros finais (da URL e do corpo):", params);
                break;
            }
        }

        if (!matchingRoute) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        let targetUrl = matchingRoute.targetUrl;

        // Substitui parâmetros na URL de destino
        Object.keys(params).forEach((param) => {
            const regex = new RegExp(`[:{]${param}[}]?`, 'g'); // Suporta tanto `:param` quanto `{param}`
            targetUrl = targetUrl.replace(regex, params[param]);
        });

        const queryParams = new URLSearchParams(req.query).toString();
        if (queryParams) {
            targetUrl += `?${queryParams}`;
        }

        const headers = {
            'content-type': 'application/json',
            'accept': 'application/json'
        };

        const agent = new https.Agent({ rejectUnauthorized: false });

        console.log("Método:", matchingRoute.method);
        console.log("URL de destino:", targetUrl);
        console.log("Cabeçalhos:", headers);
        console.log("Corpo da requisição recebido:", req.body);

        const response = await axios({
            method: matchingRoute.method,
            url: targetUrl,
            headers: headers,
            data: Object.keys(req.body).length ? req.body : undefined, // Só envia req.body se não estiver vazio
            httpsAgent: agent
        });

        console.log("Status da resposta:", response.status);
        console.log("Dados da resposta:", response.data);

        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Erro ao redirecionar a requisição:', error);
        res.status(500).json({ message: 'Erro ao redirecionar a requisição', error: error.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
