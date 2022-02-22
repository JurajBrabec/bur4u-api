const server = require('./server.js');
const make = require('../models/proxy-responses-v1.js');
const tokenService = require('./tokenServiceAPI.js');
const logger = require('./logger.js');
const update = require('./update.js');
const { version } = require('../modules.js');

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

module.exports.init = async ({
  add,
  root,
  providers,
  queryInterval,
  tsaEnv,
}) => {
  if (add) return addProvider(add, root);
  if (tsaEnv) tokenService.setEnvironment(tsaEnv);
  update.onUpdate((body) => updateProviders(root, providers, body));
  const readProviders = async () => {
    try {
      await readProviders(root, providers);
      logger.stdout(`Imported ${providers.length} providers.`);
    } catch (error) {
      throw new Error(`importing providers: ${error.message}`);
    }
  };
  readProviders().then(() => setInterval(readProviders, queryInterval * 1000));
};

const addProvider = async (provider, root) => {
  const [name, port] = provider.split(':');
  const addr = `${name}:${port || 28748}`;
  let api_token = '';
  console.log(`Adding provider ${name}...`);
  try {
    const response = await server.anonymousGet(`${addr}${root}/token`);
    if (response.status !== 200) {
      throw new Error(`${response.status}:${response.statusText}`);
    }
    api_token = await response.text();
    const entry = { addr, api_token };
    console.log(`Successfully registered provider ${name}.`);
    console.log('Add following entry to "providers" array in config file:');
    console.log(entry);
    process.exit(0);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

readProviders = async (root, providers) => {
  try {
    const responses = await Promise.all(
      providers.map((provider) => exports.query(provider, `${root}/clients`))
    );
    _providers = providers.map((provider, index) => {
      const { timeStamp, status, data } = responses[index];
      const providerVersion = data?.version;
      if (providerVersion !== version)
        updateProvider(
          root,
          provider.addr,
          provider.api_token,
          update.distBody
        );
      return make.Entry({
        ...provider,
        ...{ timeStamp, status, version: providerVersion, data },
      });
    });
  } catch (error) {
    logger.stderr(`Error importing providers: ${error.message}`);
  }
  return _providers;
};

updateProvider = async (root, addr, api_token, body) => {
  try {
    logger.stdout(`Updating ${addr}...`);
    const response = await server.post(
      `${addr}${root}/script/update`,
      api_token,
      await body()
    );
    if (response.status !== 200) throw new Error(response.statusText);
    logger.stdout(`Update ${addr} ${await response.text()}`);
    return true;
  } catch (error) {
    logger.stderr(`Error updating provider ${addr}: ${error.message}`);
    return false;
  }
};

updateProviders = async (root, providers, body) => {
  let result = true;
  for (let { addr, api_token } of providers) {
    result = result && (await updateProvider(root, addr, api_token, body));
  }
  return result;
};
