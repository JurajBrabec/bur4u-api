const { configurator } = require('./modules.js');
const express = require('./services/express.js');
const server = require('./services/server.js');

const API_ROOT = '/api/v1';
const CACHE_INTERVAL = '15 seconds';
const LOG_ROT = '1d';
const MODULE_API = 'api';
const MODULE_PROXY = 'proxy';
const PORT = 28748;
const CONFIG_FILE = 'bur4u-api.config.js';

try {
  console.log('BUR 4U API v1.0');

  const mainConfig = configurator.expect
    .jsFile({ configFile: { arg: 'config', default: CONFIG_FILE } })
    .string({
      moduleName: {
        arg: 'module',
        required: true,
        do: (value) => value.toLowerCase(),
      },
    })
    .string({ cacheTime: { arg: 'cache', default: CACHE_INTERVAL } })
    .path({ logPath: { arg: 'log' } })
    .string({ logRotation: { arg: 'logrot', default: LOG_ROT } })
    .num({ port: { default: PORT } })
    .save();

  const apiConfig = configurator.expect
    .new()
    .path({ nbuBinPath: { arg: 'bin', required: true } })
    .string('domain')
    .string('user')
    .string('password')
    .save();

  const proxyConfig = configurator.expect
    .new()
    .array({ providers: { arg: 'list', default: [] } })
    .num({ queryInterval: { arg: 'interval', default: 60 } })
    .string('tsaEnv')
    .bool('ui')
    .save();

  const { moduleName, cacheTime, logPath, logRotation, port, ui } =
    configurator.compile(mainConfig);

  let routes;
  switch (moduleName) {
    case MODULE_API:
      const { NBU } = require('./modules.js');
      const { cacheConfig, cacheInterval } = require('./services/api.js');
      const jwt = require('./services/jwtAPI.js');
      routes = require('./routes/api-v1.js');
      const { nbuBinPath, domain, user, password } =
        configurator.compile(apiConfig);
      const login = user ? { domain, user, password } : undefined;
      NBU({ bin: nbuBinPath, login })
        .then((nbu) => {
          jwt.setIssuer(nbu.masterServer);
          console.log(`Started NBU integration with ${nbu.masterServer}.`);
          cacheConfig().then(() => setInterval(cacheConfig, cacheInterval));
        })
        .catch((error) => {
          throw new Error(`starting NBU integration: ${error.message}`);
        });
      break;
    case MODULE_PROXY:
      const tokenService = require('./services/tokenServiceAPI.js');
      const Providers = require('./services/proxy.js');
      routes = require('./routes/proxy-v1.js');
      const { providers, queryInterval, tsaEnv } =
        configurator.compile(proxyConfig);
      if (tsaEnv) tokenService.setEnvironment(tsaEnv);
      const readProviders = () =>
        Providers.read(API_ROOT, providers)
          .then((providers) =>
            console.log(`Imported ${providers.length} providers.`)
          )
          .catch((error) => {
            throw new Error(`importing providers: ${error.message}`);
          });
      readProviders().then(() => {
        setInterval(readProviders, queryInterval * 1000);
      });
      break;
    default:
      throw new Error(`wrong parameter --module '${moduleName}'.`);
  }
  const app = express({
    moduleName,
    cacheTime,
    logPath,
    logRotation,
    root: API_ROOT,
    routes,
    ui,
  });
  const callBack = () =>
    console.log(`${moduleName} module ready (https://localhost:${port})`);
  server.create({ app, port, callBack });
} catch (error) {
  console.error(`Error: ${error.message}`);
}
