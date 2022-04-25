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
const CACHE_CRON = '0 */8 * * *';
const CACHE_CONCURRENCY = 8;
const QUERY_CRON = '0 * * * *';
const SM9_HISTORY = 60;
const OUTPUT_PATH = '.';
const INIT_EXIT_CODE = 1;

const CONFIG_CHANGES = [
  { add: 'cacheCron', value: `'0 */8 * * *'`, before: 'cacheInterval' },
  { add: 'eslCron', value: `'0 */6 * * *'`, before: 'eslInterval' },
  { add: 'queryCron', value: `'*/5 * * * *'`, before: 'queryInterval' },
  { remove: 'domain' },
  { remove: 'user' },
  { remove: 'password' },
  { remove: 'cacheInterval' },
  { remove: 'eslInterval' },
  { remove: 'sm9Interval' },
  { remove: 'sm9Path' },
  { remove: 'sm9History' },
  { remove: 'queryInterval' },
  { remove: 'tsaEnv' },
];

const main = async () => {
  try {
    logger.stdout(`${description} v${version}`);

    await update.updateConfigFile(CONFIG_CHANGES);

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

    const { moduleName, cacheTime, logPath, logRotation, port } =
      configurator.compile(mainConfig);

    let mainModule;
    let params;
    let routes;
    let ui;

    switch (moduleName) {
      case MODULE_API:
        const apiConfig = configurator.expect
          .new()
          .path({ nbuBinPath: { arg: 'bin', required: true } })
          .string({ nbuDataPath: { arg: 'data' } })
          .string('domain')
          .string('user')
          .string('password')
          .path('eslExport')
          .string('eslCron')
          .path({ eslPath: { default: OUTPUT_PATH } })
          .path('sm9Export')
          .string('sm9Cron')
          .path({ sm9Path: { default: OUTPUT_PATH } })
          .num({ sm9History: { default: SM9_HISTORY } })
          .string({ cacheCron: { arg: 'cron', default: CACHE_CRON } })
          .num({
            cacheConcurrency: {
              arg: 'concurrency',
              default: CACHE_CONCURRENCY,
            },
          })
          .save();
        mainModule = require('./services/api.js');
        routes = require('./routes/api-v1.js');
        params = configurator.compile(apiConfig);
        break;
      case MODULE_PROXY:
        const proxyConfig = configurator.expect
          .new()
          .string({ root: { default: API_ROOT } })
          .array({ providers: { arg: 'list', default: [] } })
          .string({ queryCron: { arg: 'cron', default: QUERY_CRON } })
          .string({ addName: { arg: 'add' } })
          .string({ tsaEnv: { default: 'PROD' } })
          .bool('ui')
          .save();
        mainModule = require('./services/proxy.js');
        routes = require('./routes/proxy-v1.js');
        params = configurator.compile(proxyConfig);
        ui = params.ui;
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
      logger.stdout(
        `${moduleName.toUpperCase()} module ready (https://localhost:${port})`
      );

    await mainModule.init(params);
    await update.check();
    await server.create({ app, port, callBack });
    update.watch();
  } catch (error) {
    logger.stderr(`Initialization error ${error.message}`);
    process.exit(INIT_EXIT_CODE);
  }
};

main();
