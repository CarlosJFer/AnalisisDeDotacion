// Controller to handle web-vitals metrics
const logger = require('../utils/logger');

const registerINP = (req, res) => {
  const { value } = req.body || {};
  logger.debug('INP metric received:', value);
  res.json({ success: true });
};

module.exports = { registerINP };

