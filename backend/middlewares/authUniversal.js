const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const authUniversal = async (req, res, next) => {
  try {
    // 1. Tenta autenticar via cookie (usado pelo navegador)
    const tokenFromCookie = req.cookies.token;
    if (tokenFromCookie) {
      const decoded = jwt.verify(tokenFromCookie, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    }

    // 2. Tenta autenticar via Basic Auth (usado por Postman/cURL)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');

      const user = await User.findOne({ username });
      if (user && await bcrypt.compare(password, user.password)) {
        req.user = { id: user._id, username: user.username };
        return next();
      } else {
        return res.status(401).json({ message: 'Usuário ou senha inválidos' });
      }
    }

    // Se nenhuma autenticação for fornecida
    const isApi = req.originalUrl.includes('/api/');
    if (isApi) {
      return res.status(401).json({ message: 'Não autenticado. Use token ou Basic Auth' });
    } else {
      return res.redirect('/healthgate/login');
    }
  } catch (err) {
    console.error('Erro na autenticação:', err.message);
    return res.status(403).json({ message: 'Falha na autenticação' });
  }
};

module.exports = authUniversal;
