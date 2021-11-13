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
  const { data } = await exports.query(provider, '/api/v1/clients');
  _providers = [make.Entry({ ...provider, ...{ timeStamp, status, data } })];
  return _providers;
};

module.exports.resolve = function (req, res, next) {
  req.providers = _providers;
  next();
};

module.exports.query = async (provider, url) => {
  const nbu = await NBU();
  let data;
  switch (url) {
    case '/api/v1/clients':
      const clients = await nbu.clients();
      data = { timeStamp, clients };
      break;
    case `/api/v1/clients/${client}`:
      const activeJobs = await nbu.jobs({ daysBack: 1 });
      const policies = await nbu.policies();
      data = { timeStamp, activeJobs, policies };
      break;
    case `/api/v1/clients/${client}/history`:
      const jobs = await nbu.jobs();
      data = { timeStamp, jobs };
      break;
    default:
      data = { timeStamp, error: `No data for "${url}" endpoint` };
      break;
  }
  return make.Provider({ ...provider, data });
};

exports.read();
