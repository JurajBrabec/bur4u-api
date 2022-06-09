const { configurator } = require('./modules.js');
const service = require('./services/api.js');
const routes = require('./routes/api/v1');

const OUTPUT_PATH = '.';
const CACHE_CRON = '0 */8 * * *';
const CACHE_CONCURRENCY = 8;

module.exports = async () => {
  const config = configurator.expect
    .new()
    .path({ nbuBinPath: { arg: 'bin', required: true } })
    .string({ nbuDataPath: { arg: 'data' } })
    .path('eslExport')
    .string('eslCron')
    .path({ eslPath: { default: OUTPUT_PATH } })
    .string({ cacheCron: { arg: 'cron', default: CACHE_CRON } })
    .num({
      cacheConcurrency: {
        arg: 'concurrency',
        default: CACHE_CONCURRENCY,
      },
    })
    .save();

  const params = configurator.compile(config);
  await service.init(params);

  return { routes: { path: '/api/v1', routes } };
};
