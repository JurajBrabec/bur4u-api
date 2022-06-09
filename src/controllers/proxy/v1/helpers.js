const { version } = require('../../../modules.js');
const make = require('../../../models/proxy/v1');
const { get, query } = require('../../../services/proxy.js');
const tsa = require('../../../services/tsa');
const update = require('../../../services/update.js');

module.exports = { get, query, tsa, make, update, version };
