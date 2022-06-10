const { Cached, NBU } = require('../modules');
const { access } = require('./fileSystem.js');
const jwt = require('./jwt');
const logger = require('./logger.js');
const ESL = require('./esl.js');
const { scheduleJob } = require('./cron.js');

const cached = Cached.depot('config');

const parallelPromises = (promises, length) => {
  const next = () => {
    const promise = promises.shift();
    return !promise ? null : Promise.allSettled([promise()]).then(() => next());
  };
  return Promise.all(Array.from({ length }, next));
};

const INIT_INTERVAL = 1000 * 60;

const CACHE_AGE = {
  clients: 1000 * 60 * 5,
  jobs: 1000 * 60,
  policies: 1000 * 60 * 5,
};

const waitForNbu = async ({ bin, age }) => {
  let nbu;
  do {
    try {
      nbu = await NBU({ bin, age });
    } catch (error) {
      if (!/NBU is down/.test(error.message))
        throw new Error(`starting NBU integration: ${error.message}`);
      if (nbu === undefined) logger.stderr(`Waiting for NBU...`);
      nbu = null;
      await new Promise((r) => setTimeout(r, INIT_INTERVAL));
    }
  } while (!nbu);
  return nbu;
};

const waitForPath = async (path) => {
  let success;
  do {
    try {
      await access(path);
      success = true;
    } catch (error) {
      if (success === undefined) logger.stderr(`Waiting for ${path}...`);
      success = false;
      await new Promise((r) => setTimeout(r, INIT_INTERVAL));
    }
  } while (!success);
  return success;
};

module.exports.init = async ({
  nbuDataPath,
  nbuBinPath,
  eslCron,
  eslExport,
  eslPath,
  cacheCron,
  cacheConcurrency,
}) => {
  if (nbuDataPath) await waitForPath(nbuDataPath);
  const nbu = await waitForNbu({
    bin: nbuBinPath,
    age: CACHE_AGE,
  });
  jwt.setIssuer(nbu.masterServer);
  logger.stdout(`Started NBU integration with ${nbu.masterServer}.`);
  if (eslExport) process.exit(await ESL({ nbu, outputPath: eslExport }));
  if (eslCron) scheduleJob(eslCron, () => ESL({ nbu, outputPath: eslPath }));
  const cacheConfigs = async () => {
    let buf = 0;
    logger.stdout(`Caching of clients started...`);
    try {
      const clients = await nbu.clients();
      const promises = clients.map(
        (client, index) => async () =>
          cached.set(client.name, async () => {
            let config;
            try {
              const started = new Date().getTime();
              buf++;
              config = await nbu.config({ client: client.name });
              const ended = new Date().getTime();
              const duration = ((ended - started) / 1000).toFixed(1);
              if (duration > 10) {
                logger.stdout(
                  `${index + 1}/${clients.length} ${client.name} ${
                    config[0].versionName ? 'OK' : config[0].clientMaster
                  } (${duration}s)`
                );
                if (buf > 1 && buf < cacheConcurrency)
                  logger.stdout(`${buf - 1} remaining...`);
              }
            } catch (error) {
              logger.stderr(`Error caching ${client.name}: ${error.message}`);
            }
            buf--;
            return config;
          })
      );
      await parallelPromises(promises, cacheConcurrency);
      logger.stdout(`Successfully cached ${clients.length} clients.`);
    } catch (error) {
      throw new Error(`caching clients: ${error.message}`);
    }
  };
  if (cacheCron) scheduleJob(cacheCron, cacheConfigs);
};
