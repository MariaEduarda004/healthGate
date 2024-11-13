const axios = require('axios');
const https = require('https');

(async () => {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false  // Ignora problemas de certificado SSL (caso necessários)
        });

        const response = await axios({
            method: 'POST',
            url: 'http://localhost:3001/api/fassecg/Observation', // A URL do seu endpoint
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "resourceType": "Observation"  // Corpo da requisição JSON
            },
            httpsAgent: agent  // Configura o agente HTTPS
        });

        console.log("Status da resposta:", response.status);
        console.log("Dados da resposta:", response.data);
    } catch (error) {
        console.error("Erro ao fazer a requisição:", error.message);
        if (error.response) {
            console.error("Status do erro:", error.response.status);
            console.error("Dados do erro:", error.response.data);
        }
    }
})();
