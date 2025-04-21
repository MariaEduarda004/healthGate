const Log = require('../models/Log');

exports.listLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100); // últimos 100 logs
    res.render('logs', { logs });
  } catch (error) {
    console.error('Erro ao buscar logs:', error.message);
    res.status(500).send('Erro ao buscar logs');
  }
};
