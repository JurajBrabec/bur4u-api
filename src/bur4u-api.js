const { configurator, version } = require('./modules.js');
const express = require('./services/express.js');
const server = require('./services/server.js');
const logger = require('./services/logger.js');
const update = require('./services/update.js');

const API_ROOT = '/api/v1';
const CACHE_TIME = '15 seconds';
const LOG_ROT = '1d';
const MODULE_API = 'api';
const MODULE_PROXY = 'proxy';
const PORT = 28748;
const CONFIG_FILE = 'bur4u-api.config.js';
const CACHE_INTERVAL = 60 * 60 * 12;
const CACHE_CONCURRENCY = 8;
const QUERY_INTERVAL = 60;

try {
  console.log(`BUR 4U API v${version}`);

  const mainConfig = configurator.expect
    .jsFile({ configFile: { arg: 'config', default: CONFIG_FILE } })
    .string({
      moduleName: {
        arg: 'module',
        required: true,
        do: (value) => value.toLowerCase(),
      },
    })
    .string({ cacheTime: { arg: 'cache', default: CACHE_TIME } })
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
    .num({ cacheInterval: { arg: 'interval', default: CACHE_INTERVAL } })
    .num({
      cacheConcurrency: { arg: 'concurrency', default: CACHE_CONCURRENCY },
    })
    .save();

  const proxyConfig = configurator.expect
    .new()
    .array({ providers: { arg: 'list', default: [] } })
    .num({ queryInterval: { arg: 'interval', default: QUERY_INTERVAL } })
    .string('tsaEnv')
    .bool('ui')
    .save();

  const { moduleName, cacheTime, logPath, logRotation, port, ui } =
    configurator.compile(mainConfig);

  let routes;
  let init;
  switch (moduleName) {
    case MODULE_API:
      routes = require('./routes/api-v1.js');
      const api = require('./services/api.js');
      init = api.init(configurator.compile(apiConfig));
      break;
    case MODULE_PROXY:
      routes = require('./routes/proxy-v1.js');
      const proxy = require('./services/proxy.js');
      init = proxy.init({
        root: API_ROOT,
        ...configurator.compile(proxyConfig),
      });
      break;
    default:
      throw new Error(`wrong parameter --module '${moduleName}'.`);
  }
  init.catch((error) => {
    logger.stderr(`Initialization error ${error.message}`);
    process.exit(1);
  });
  update.watch(moduleName);
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
    console.log(
      `${moduleName.toUpperCase()} module ready (https://localhost:${port})`
    );
  server.create({ app, port, callBack });
} catch (error) {
  logger.stderr(`Error ${error.message}`);
  process.exit(1);
}
