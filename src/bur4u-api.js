const {
  configurator,
  createModule,
  description,
  version,
} = require('./modules.js');
const express = require('./services/express.js');
const logger = require('./services/logger.js');
const server = require('./services/server.js');
const update = require('./services/update.js');

const CACHE_TIME = '15 seconds';
const CONFIG_FILE = './conf/bur4u-api.config.js';
const INIT_EXIT_CODE = 1;
const LOG_ROT = '1d';
const PORT = 28748;

const main = async () => {
  try {
    logger.stdout(`${description} v${version}`);

    await update.updateConfigFile();

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

    const settings = await createModule(moduleName);

    const app = express({
      moduleName,
      cacheTime,
      logPath,
      logRotation,
      ...settings,
    });
    const callBack = () =>
      logger.stdout(
        `${moduleName.toUpperCase()} module ready (https://localhost:${port})`
      );

    await update.check();
    await server.create({ app, port, callBack });
    update.watch();
  } catch (error) {
    logger.stderr(`Initialization error ${error.message}`);
    process.exit(INIT_EXIT_CODE);
  }
};

main();
