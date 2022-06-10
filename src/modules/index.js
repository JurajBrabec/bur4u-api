module.exports = require('./bur4u-api-modules.js');
module.exports.DEV = /dev|test/.test(process.env.npm_lifecycle_event);

const MODULE_API = 'api';
const MODULE_PROXY = 'proxy';

module.exports.createModule = async (moduleName) => {
  switch (moduleName) {
    case MODULE_API:
      const api = require('./module-api.js');
      return api();
    case MODULE_PROXY:
      const proxy = require('./module-proxy.js');
      return proxy();
    default:
      throw new Error(`wrong parameter --module '${moduleName}'.`);
  }
};
