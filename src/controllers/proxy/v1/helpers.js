const { version } = require('../../../modules');
const make = require('../../../models/proxy/v1');
const { get, query } = require('../../../services/proxy.js');
const tsa = require('../../../services/tsa');
const update = require('../../../services/update.js');
const config = require('../../../services/config.js')('proxy');

module.exports = {
  config,
  get,
  query,
  tsa,
  make,
  update,
  version,
};
