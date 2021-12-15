const { NBU } = require('../modules.js');
const jwt = require('./jwtAPI.js');
const cached = require('../../lib/cached.js');
const logger = require('./logger.js');

const paralelPromises = (promises, length) => {
  const next = () => {
    const promise = promises.shift();
    return !promise ? null : Promise.allSettled([promise()]).then(() => next());
  };
  return Promise.all(Array.from({ length }, next));
};

module.exports.init = async ({
  nbuBinPath,
  domain,
  user,
  password,
  cacheInterval,
  cacheConcurrency,
}) => {
  const login = user ? { domain, user, password } : undefined;
  try {
    const nbu = await NBU({ bin: nbuBinPath, login });
    jwt.setIssuer(nbu.masterServer);
    console.log(`Started NBU integration with ${nbu.masterServer}.`);

    const cacheConfigs = async () => {
      let buf = 0;
      logger.stdout(`Caching of clients started`);
      try {
        const clients = await nbu.clients();
        const promises = clients.map(
          (client, index) => async () =>
            cached.set(`config-${client.name}`, async () => {
              let config;
              try {
                const started = new Date().getTime();
                buf++;
                config = await nbu.config({ client: client.name });
                const ended = new Date().getTime();
                const duration = ((ended - started) / 1000).toFixed(1);
                logger.stdout(
                  `${index + 1}/${clients.length} ${client.name} ${
                    config[0].versionName ? 'OK' : config[0].clientMaster
                  } (${duration}s)`
                );
                if (buf > 1 && buf < cacheConcurrency)
                  logger.stdout(`${buf - 1} remaining...`);
              } catch (error) {
                logger.stderr(`Error caching ${client.name}: ${error.message}`);
              }
              buf--;
              return config;
            })
        );
        await paralelPromises(promises, cacheConcurrency);
        logger.stdout(`Successfuly cached ${clients.length} clients.`);
      } catch (error) {
        throw new Error(`caching clients: ${error.message}`);
      }
    };
    await cacheConfigs();
    setInterval(cacheConfigs, cacheInterval * 1000);
  } catch (error) {
    throw new Error(`starting NBU integration: ${error.message}`);
  }
};
