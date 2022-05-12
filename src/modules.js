module.exports = require('./bur4u-api-modules.js');
module.exports.DEV = /dev|test/.test(process.env.npm_lifecycle_event);
