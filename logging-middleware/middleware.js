const axios = require('axios');

const loggingMiddleware = async (req, res, next) => {
  const logData = {
    stack: req.stack || 'backend', // Set in route or component
    level: 'info',
    package: req.package || 'middleware',
    message: `Request received: ${req.method} ${req.url}`,
  };

  try {
    await axios.post('http://20.244.56.144/evaluation-service/logs', logData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLIENT_SECRET}`,
      },
    });
  } catch (error) {
    console.error('Logging failed:', error.message); // Fallback to console
  }
  next();
};

module.exports = loggingMiddleware;