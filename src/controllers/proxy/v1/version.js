const { version } = require('./helpers.js');

module.exports = (req, res) => res.status(200).json({ version });
