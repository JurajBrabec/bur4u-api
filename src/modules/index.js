module.exports = require('../bur4u-api-modules.js');

const MODULE_API = 'api';
const MODULE_PROXY = 'proxy';

module.exports.DEV = /dev|test/.test(process.env.npm_lifecycle_event);

module.exports.createModule = async (moduleName) => {
  switch (moduleName) {
    case MODULE_API:
      return require('./module-api.js')();
    case MODULE_PROXY:
      return require('./module-proxy.js')();
    default:
      throw new Error(`wrong parameter --module '${moduleName}'.`);
  }
};
