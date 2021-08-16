const make = require('../models/proxy-responses-v1.js');
const Providers = require('../services/providers.js');
const tokenService = require('../services/tokenServiceAPI.js');

const version = '1.0.0';

module.exports.version = (req, res) => res.status(200).json({ version });

module.exports.options = (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Auth-Token, X-Subject-Token'
  );
  res.sendStatus(200);
};

module.exports.token = async (req, res) => {
  if (req.query.hasOwnProperty('local')) return res.send(tokenService.id);
  try {
    const token = await tokenService.tokenId();
    res.send(token);
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};

module.exports.provider = async (req, res) => {
  try {
    const { hostName } = req.params;
    res.json(
      make.Provider(
        Providers.get()
          .filter((provider) => provider.name === hostName)
          .shift()
      )
    );
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};

module.exports.providers = async (req, res) => {
  try {
    res.json(
      make.Providers(
        Providers.get().map((provider) => {
          const { timeStamp, name, status } = provider;
          const clients = provider.data?.clients?.length || 0;
          return { timeStamp, name, status, clients };
        })
      )
    );
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};

module.exports.proxy = (req, res) =>
  Promise.all(
    req.providers.map((provider) => Providers.query(provider, req.originalUrl))
  )
    .then((providers) => res.json(make.Providers(providers)))
    .catch((error) => res.status(400).json(make.Error(error)));
