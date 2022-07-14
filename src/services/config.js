const { writeFile } = require('./fileSystem.js');
const { Response } = require('../models/responses-v1.js');
const currentConfig = require('../../conf/bur4u-api.config.js');
const defaultConfig = require('../../conf/bur4u-api.default-config.js');
const CONFIG_FILE = process.cwd() + '/conf/bur4u-api.config.js';

module.exports = (moduleName) => {
  return async function (req, res) {
    const response = new Response();
    response.moduleName = moduleName;
    if (req.method === 'GET') {
      response.currentConfig = currentConfig;
      response.defaultConfig = defaultConfig;
      return res.json(response);
    }
    if (req.method === 'POST') {
      response.config = req.body;
      console.log(response.config);
      await writeFile(CONFIG_FILE + '.json', JSON.stringify(response.config), {
        encoding: 'utf8',
      });
      res.json(response);
      process.exit(3);
    }
  };
};
