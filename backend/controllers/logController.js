const Log = require('../models/Log');

exports.listLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }); 

    const statusCounts = {
      success: 0, // 2xx
      clientError: 0, // 4xx
      serverError: 0 // 5xx
    };

    logs.forEach(log => {
      if (log.statusCode >= 200 && log.statusCode < 300) {
        statusCounts.success++;
      } else if (log.statusCode >= 400 && log.statusCode < 500) {
        statusCounts.clientError++;
      } else if (log.statusCode >= 500) {
        statusCounts.serverError++;
      }
    });

    res.render('logs', { logs, statusCounts });
  } catch (error) {
    console.error('Erro ao buscar logs:', error.message);
    res.status(500).send('Erro ao buscar logs');
  }
};

