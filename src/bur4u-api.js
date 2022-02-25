const { configurator, description, version } = require('./modules.js');
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
const CONFIG_FILE = './conf/bur4u-api.config.js';
const CACHE_INTERVAL = 60 * 60 * 12;
const CACHE_CONCURRENCY = 8;
const QUERY_INTERVAL = 60;
const SM9_HISTORY = 60;
const OUTPUT_PATH = '.';

try {
  console.log(`${description} v${version}`);

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
    .path('eslExport')
    .num({ eslInterval: { default: 0 } })
    .path({ eslPath: { default: OUTPUT_PATH } })
    .path('sm9Export')
    .num({ sm9Interval: { default: 0 } })
    .path({ sm9Path: { default: OUTPUT_PATH } })
    .num({ sm9History: { default: SM9_HISTORY } })
    .num({ cacheInterval: { arg: 'interval', default: CACHE_INTERVAL } })
    .num({
      cacheConcurrency: { arg: 'concurrency', default: CACHE_CONCURRENCY },
    })
    .save();

  const proxyConfig = configurator.expect
    .new()
    .array({ providers: { arg: 'list', default: [] } })
    .num({ queryInterval: { arg: 'interval', default: QUERY_INTERVAL } })
    .string({ addName: { arg: 'add' } })
    .string('tsaEnv')
    .bool('ui')
    .save();

  const { moduleName, cacheTime, logPath, logRotation, port, ui } =
    configurator.compile(mainConfig);

  let mainModule;
  let params;
  let routes;
  switch (moduleName) {
    case MODULE_API:
      mainModule = require('./services/api.js');
      params = configurator.compile(apiConfig);
      routes = require('./routes/api-v1.js');
      break;
    case MODULE_PROXY:
      mainModule = require('./services/proxy.js');
      params = {
        root: API_ROOT,
        ...configurator.compile(proxyConfig),
      };
      routes = require('./routes/proxy-v1.js');
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

  mainModule
    .init(params)
    .then(() => update.check(moduleName))
    .then(() => {
      const callBack = () =>
        console.log(
          `${moduleName.toUpperCase()} module ready (https://localhost:${port})`
        );
      server.create({ app, port, callBack });
      update.watch(moduleName);
    })
    .catch((error) => {
      throw new Error(`Initialization error ${error.message}`);
    });
} catch (error) {
  logger.stderr(`Error ${error.message}`);
  process.exit(1);
}
