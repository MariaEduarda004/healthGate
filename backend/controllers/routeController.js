const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    console.log('Dados recebidos no req.body:', req.body);
    ['routeParams', 'queryParams', 'headers'].forEach(field => {
      if (req.body[field]) {
        if (typeof req.body[field] === 'string') {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (error) {
            console.error(`Erro ao converter ${field}:`, error.message);
            return res.status(400).send(`Erro: ${field} deve ser um JSON válido.`);
          }
        }
      }
    });

    console.log('Dados prontos para salvar no banco:', req.body);

    const newRoute = new Route(req.body);
    await newRoute.save();
    console.log('Rota salva com sucesso no banco:', newRoute);

    res.redirect('/healthgate/routes');
  } catch (error) {
    console.error('Erro ao cadastrar rota:', error.message);
    res.status(500).send('Erro ao cadastrar rota: ' + error.message);
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
