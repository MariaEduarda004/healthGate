# HealthGate
### O **HealthGate** é um sistema projetado para facilitar a integração dos sistemas desenvolvidos no grupo IF4heath: https://if4health.netlify.app/. Nele podemos realizar o cadastro das rotas existentes no FASS-ECG e IF-CLOUD para elaboração de um Gateway que irá rotear as requisições de forma eficiente e segura.
![image](https://github.com/user-attachments/assets/ed9325f1-7d6e-4bb9-acd8-26e48d2a5502)

## Funcionalidades

- CRUD de rotas existentes nos sistemas FASS-ECG (https://github.com/if4health/FASS-ECG) e IF-CLOUD (https://github.com/if4health/ifcloud)
  
## Tecnologias Utilizadas

- **Node.js**: Plataforma para o backend.
- **Axios**: Biblioteca para realizar requisições HTTP.
- **React**: Linguagem utilizada para criação do frontend.
-  **Mongo**: Banco de dados utilizado para armazenamento.
- **Express.js**: Framework para construir a API RESTful.

## Pré-requisitos

Antes de executar o projeto, certifique-se de que as seguintes dependências estejam instaladas:

- **Node.js** (versão 14.x ou superior)
- **NPM** ou **Yarn** para gerenciar pacotes
- **Acesso ao servidor FHIR** para testar a integração

## Instalação
1. Baixe o MongoDB a partir do [site](https://www.mongodb.com/try/download/community) oficial.
   Siga o assistente de instalação e certifique-se de marcar a opção "Run MongoDB as a Service".
   Após a instalação, abra o terminal e execute o comando mongod para iniciar o MongoDB.
1. Clone o repositório do projeto:
 ```bash
   git clone https://github.com/MariaEduarda004/healthGate.git
   cd health-gate
  ````
2. Instale as dependências:
Se estiver usando o npm:
 ```bash
  npm install
  ````
  Ou com Yarn:
  ```bash
  yarn install
  ````
3. Configure as variáveis de ambiente, como o token de autenticação e a URL do servidor FHIR, no arquivo .env. Exemplo:
  ```bash
   FHIR_SERVER_URL=https://hapi.fhir.org/baseR4
   BEARER_TOKEN=
  ````
4. Inicie o servidor de desenvolvimento:
  ````bash
  npm start
  ````
  Ou com Yarn:
   ````bash
  yarn start
  ````
O sistema estará disponível em http://localhost:3001.
