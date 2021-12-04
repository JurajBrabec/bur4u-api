const { NBU } = require('../modules.js');
const cached = require('../../lib/cached.js');

const LIMIT = 5;
const INTERVAL = 1000 * 60 * 60 * 12;

let buf;

const paralelPromises = (promises, length = LIMIT) => {
  buf = 0;
  const next = () => {
    const promise = promises.shift();
    return !promise ? null : Promise.allSettled([promise()]).then(() => next());
  };
  return Promise.all(Array.from({ length }, next));
};

module.exports.cacheConfig = () =>
  NBU().then((nbu) =>
    nbu
      .clients()
      .then((clients) =>
        paralelPromises(
          clients.map(
            (client, index) => () =>
              cached.set(`config-${client.name}`, () => {
                const started = new Date().getTime();
                buf++;
                return nbu
                  .config({ client: client.name })
                  .then((config) => {
                    const ended = new Date().getTime();
                    const duration = ((ended - started) / 1000).toFixed(1);
                    buf--;
                    console.log(
                      `${index + 1}/${clients.length} ${client.name} ${
                        config[0].versionName ? 'OK' : config[0].clientMaster
                      } (${duration}s)`
                    );
                    if (buf > 0 && buf < LIMIT - 1)
                      console.log(`${buf} remaining...`);
                    return config;
                  })
                  .catch(console.error);
              })
          )
        ).then(() =>
          console.log(`Successfuly cached ${clients.length} clients.`)
        )
      )
      .catch((error) => {
        throw new Error(`Error "${error.message}" caching clients.`);
      })
  );

module.exports.cacheInterval = INTERVAL;
