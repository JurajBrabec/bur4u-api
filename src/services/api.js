const { Cached, NBU } = require('../modules.js');
const jwt = require('./jwtAPI.js');
const logger = require('./logger.js');
const ESL = require('./esl.js');
const SM9 = require('./sm9.js');

const cached = Cached.depot('config');

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
  eslExport,
  eslInterval,
  eslPath,
  sm9Export,
  sm9History,
  sm9Interval,
  sm9Path,
  cacheInterval,
  cacheConcurrency,
}) => {
  const credentials = user ? { domain, user, password } : undefined;
  try {
    const nbu = await NBU({ bin: nbuBinPath, credentials });
    jwt.setIssuer(nbu.masterServer);
    console.log(`Started NBU integration with ${nbu.masterServer}.`);
    if (eslExport) process.exit(await ESL({ nbu, outputPath: eslExport }));
    if (sm9Export)
      process.exit(
        await SM9({ nbu, outputPath: sm9Export, minutes: sm9History })
      );
    if (eslInterval)
      ESL({ nbu, outputPath: eslPath }).then(() =>
        setInterval(() => ESL({ nbu, outputPath: eslPath }), eslInterval * 1000)
      );
    if (sm9Interval)
      SM9({ nbu, outputPath: sm9Path, minutes: sm9History }).then(() =>
        setInterval(
          () => SM9({ nbu, outputPath: sm9Path, minutes: sm9History }),
          sm9Interval * 1000
        )
      );
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
        await paralelPromises(promises, cacheConcurrency);
        logger.stdout(`Successfuly cached ${clients.length} clients.`);
      } catch (error) {
        throw new Error(`caching clients: ${error.message}`);
      }
    };
    cacheConfigs().then(() => setInterval(cacheConfigs, cacheInterval * 1000));
  } catch (error) {
    throw new Error(`starting NBU integration: ${error.message}`);
  }
};
