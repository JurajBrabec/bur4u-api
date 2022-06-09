const { make, query } = require('./helpers.js');

module.exports = (req, res) =>
  Promise.all(req.providers.map((provider) => query(provider, req)))
    .then((providers) => res.json(make.Providers(providers)))
    .catch((error) => res.status(400).json(make.Error(error)));
