const { configurator, NBU } = require('./modules.js');
const express = require('./services/express.js');
const server = require('./services/server.js');
const Providers = require('./services/providers.js');
const Proxyv1Routes = require('./routes/proxy-v1.js');
const APIv1Routes = require('./routes/api-v1.js');
const tokenService = require('./services/tokenServiceAPI.js');

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
      const { nbuBinPath } = configurator.compile(apiConfig);
      NBU({ bin: nbuBinPath })
        .then((nbu) => nbu.masterServer)
        .then((masterServer) => {
          console.log(`Started NBU integration with ${masterServer}.`);
        })
        .catch((error) => {
          throw new Error(`Error ${error.message} strating NBU integration.`);
        });
      routes = APIv1Routes;
      break;
    case MODULE_PROXY:
      const { providers, queryInterval, tsaEnv } =
        configurator.compile(proxyConfig);
      if (tsaEnv) tokenService.setEnvironment(tsaEnv);
      Providers.read(API_ROOT, providers)
        .then((providers) => {
          setInterval(
            () => Providers.read(API_ROOT, providers),
            queryInterval * 1000
          );
          console.log(`Imported ${providers.length} providers.`);
        })
        .catch((error) => {
          throw new Error(`Error ${error.message} importing providers.`);
        });
      routes = Proxyv1Routes;
      break;
    default:
      throw new Error(`Wrong parameter --module '${moduleName}'.`);
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
  const line = error.message || error;
  console.error(`Error: ${line}`);
}
