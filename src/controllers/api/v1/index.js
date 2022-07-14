module.exports.config = require('./helpers.js').config;
module.exports.options = require('./options.js');
module.exports.token = require('./token.js');
module.exports.update = require('./update.js');
module.exports.version = require('./version.js');

module.exports.clients = require('./clients.js');
module.exports.client = require('./client.js');
module.exports.history = require('./history.js');
module.exports.configuration = require('./configuration.js');

const status = require('./status.js');
module.exports.status = status();
module.exports.offline = status('offline');
module.exports.online = status('online');
