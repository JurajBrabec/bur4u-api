const NBU = require('../../../lib/nbu-cli.js');
const make = require('../../models/proxy-responses-v1.js');

const { masterServer, client } = NBU;
const port = 28749;

const provider = {
  addr: `${masterServer}:${port}`,
  api_token: '',
};
const timeStamp = Date.now();
const status = 'OK';

let _providers = [];

module.exports.get = () => _providers;

module.exports.read = async () => {
  const { data } = await exports.query(provider, {
    method: 'GET',
    originalUrl: '/api/v1/clients',
  });
  _providers = [make.Entry({ ...provider, ...{ timeStamp, status, data } })];
  return _providers;
};

module.exports.resolve = function (req, res, next) {
  req.providers = _providers;
  next();
};

module.exports.query = async (provider, req) => {
  const { method, body, originalUrl } = req;
  const nbu = await NBU();
  const clients = await nbu.clients();
  const config = await nbu.config();
  const policies = await nbu.policies();
  const slps = await nbu.slps();
  const jobs = await nbu.jobs();
  let data;
  switch (originalUrl) {
    case '/api/v1/clients':
      data = { timeStamp, clients };
      break;
    case `/api/v1/clients/${client}`:
      data = { timeStamp, settings: config, activeJobs: jobs, policies };
      break;
    case `/api/v1/clients/${client}/history`:
      data = { timeStamp, jobs };
      break;
    case `/api/v1/clients/${client}/configuration`:
      data = { timeStamp, settings: config, backupTypes: ['TEST'] };
      break;
    default:
      data = { timeStamp, error: `No data for "${originalUrl}" endpoint` };
      break;
  }
  return make.Provider({ ...provider, data });
};

exports.read();
