const { configurator } = require('../modules');
const service = require('../services/proxy.js');
const routes = require('../routes/proxy/v1');

const QUERY_CRON = '0 * * * *';

module.exports = async () => {
  const config = configurator.expect
    .new()
    .array({ providers: { arg: 'list', default: [] } })
    .string({ queryCron: { arg: 'cron', default: QUERY_CRON } })
    .string({ addName: { arg: 'add' } })
    .string({ tsaEnv: { default: 'PROD' } })
    .bool('ui')
    .save();

  const params = configurator.compile(config);
  const { ui } = params;

  await service.init(params);
  return { routes: [{ path: '/api/v1', routes }], ui };
};
