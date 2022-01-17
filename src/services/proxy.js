const server = require('./server.js');
const make = require('../models/proxy-responses-v1.js');
const tokenService = require('./tokenServiceAPI.js');
const logger = require('./logger.js');
const update = require('./update.js');

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
    await exports.update(root, providers);
    const responses = await Promise.all(
      providers.map((provider) => exports.query(provider, `${root}/clients`))
    );
    _providers = providers.map((provider, index) => {
      const { timeStamp, status, data } = responses[index];
      const version = data?.version;
      return make.Entry({
        ...provider,
        ...{ timeStamp, status, version, data },
      });
    });
  } catch (error) {
    logger.stderr(`Error importing providers: ${error.message}`);
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

module.exports.init = async ({ root, providers, queryInterval, tsaEnv }) => {
  if (tsaEnv) tokenService.setEnvironment(tsaEnv);
  const readProviders = async () => {
    try {
      await exports.read(root, providers);
      logger.stdout(`Imported ${providers.length} providers.`);
    } catch (error) {
      throw new Error(`importing providers: ${error.message}`);
    }
  };
  await readProviders();
  setInterval(readProviders, queryInterval * 1000);
};

module.exports.update = async (root, providers) => {
  const md5 = update.md5();
  providers.forEach(async (provider) => {
    try {
      let response;
      const { addr, api_token } = provider;
      response = await server.get(`${addr}${root}/md5`, api_token);
      const data = await response.text();
      if (data === md5) return;
      const body = await update.json();
      response = await server.post(`${addr}${root}/update`, api_token, body);
      console.log(await response.text());
    } catch (error) {
      logger.stderr(
        `Error updating provider ${provider.addr}: ${error.message}`
      );
    }
  });
};
