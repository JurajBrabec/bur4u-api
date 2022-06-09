const { Cached, NBU, version } = require('../../../modules.js');
const make = require('../../../models/api/v1');
const jwt = require('../../../services/jwt');
const update = require('../../../services/update.js');

const cached = Cached.depot('api/v1');

const getHostNames = (req) => {
  const hostNames = req.method === 'POST' ? req.body : [req.params.hostName];
  if (!Array.isArray(hostNames) || !hostNames.length || !hostNames[0])
    throw new Error('Invalid host name(s)');
  return hostNames;
};

const settings = (config) => (config ? config[0] : {});

module.exports = {
  NBU,
  cached,
  jwt,
  make,
  getHostNames,
  settings,
  update,
  version,
};
