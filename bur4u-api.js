const { parseArgs, Type } = require('./lib/parseArguments.js');
const NBU = require('./lib/nbu');
const express = require('./services/express.js');
const server = require('./services/server.js');
const Providers = require('./services/providers.js');
const Proxyv1Routes = require('./routes/proxy-v1.js');
const APIv1Routes = require('./routes/api-v1.js');

const API_ROOT = '/api/v1';
const CACHE_INTERVAL = '15 seconds';
const LOG_ROT = '1d';
const MODULE_API = 'api';
const MODULE_PROXY = 'proxy';
const PORT = 28748;
const PROVIDERS_FILE = 'providers.json';
const CONFIG_FILE = 'bur4u-api.config.js';

try {
  console.log('BUR 4U API v1.0');

  const mainArguments = [
    {
      name: 'configFile',
      arg: 'config',
      default: CONFIG_FILE,
      type: Type.Config,
    },
    {
      name: 'moduleName',
      arg: 'module',
      default: null,
      validate: (module) => {
        if (!module) throw new Error('Missing parameter --module');
        return module.toLowerCase();
      },
    },
    { name: 'cacheTime', arg: 'cache', default: CACHE_INTERVAL },
    { name: 'logPath', arg: 'log', type: Type.Path },
    { name: 'logRotation', arg: 'logrot', default: LOG_ROT },
    { name: 'port', type: Type.Num, default: PORT },
    { name: 'ui', type: Type.Bool },
  ];

  const apiArguments = [{ name: 'nbuBinPath', arg: 'bin', type: Type.Path }];
  const proxyArguments = [
    {
      name: 'providersList',
      arg: 'list',
      type: Type.File,
      default: PROVIDERS_FILE,
    },
    { name: 'queryInterval', arg: 'interval', type: Type.Num, default: 60 },
  ];

  const { moduleName, cacheTime, logPath, logRotation, port, ui } =
    parseArgs(mainArguments);

  let routes;
  switch (moduleName) {
    case MODULE_API:
      const { nbuBinPath } = parseArgs(apiArguments);
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
      const { providersList, queryInterval } = parseArgs(proxyArguments);
      Providers.read(API_ROOT, providersList)
        .then((providers) => {
          setInterval(
            () => Providers.read(API_ROOT, providersList),
            queryInterval * 1000
          );
          console.log(
            `Imported ${providers.length} providers from ${providersList}.`
          );
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
