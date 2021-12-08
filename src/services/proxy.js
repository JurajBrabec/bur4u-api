const server = require('./server.js');
const make = require('../models/proxy-responses-v1.js');

let _providers;
if (!_providers) _providers = [];
module.exports.get = () => _providers;

module.exports.resolve = function (req, res, next) {
  const hostName = req.params.hostName;

  req.providers = _providers
    .filter((provider) => provider.status === 'OK')
    .map((provider) =>
      provider.data.clients.find(
        (client) => !hostName || client.name === hostName
      )
        ? provider
        : null
    )
    .filter((provider) => provider);
  next();
};

module.exports.read = async (root, providers) => {
  try {
    const responses = await Promise.all(
      providers.map((provider) => exports.query(provider, `${root}/clients`))
    );
    _providers = providers.map((provider, index) => {
      const { timeStamp, status, data } = responses[index];
      return make.Entry({ ...provider, ...{ timeStamp, status, data } });
    });
  } catch (error) {
    console.error(`Error importing providers: ${error.message}`);
  }
  return _providers;
};

module.exports.query = async (provider, url) => {
  const { addr, api_token } = provider;
  let data = null;
  let status = null;

  try {
    const response = await server.get(`${addr}${url}`, api_token);
    status = response.statusText;
    if (response.status === 200) {
      data = await response.json();
    }
    if (response.status === 401) {
      status = await response.text();
    }
  } catch (error) {
    status = error.code || error.message || error;
  }
  return make.Provider({ ...provider, ...{ data, status } });
};
