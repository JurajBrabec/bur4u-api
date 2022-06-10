const apicache = require('apicache-plus');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch').default;
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const nJwt = require('njwt');
const rfs = require('rotating-file-stream');
const AdmZip = require('adm-zip');
const Cron = require('croner');

const { description, version } = require('../../package.json');
const configurator = require('../../lib/configurator.js');
const Cached = require('../../lib/cached.js');
const NBU = require('../../lib/nbu-cli.js');

module.exports = {
  description,
  version,
  apicache,
  configurator,
  cors,
  express,
  fetch,
  fileUpload,
  morgan,
  Cached,
  NBU,
  nJwt,
  rfs,
  AdmZip,
  Cron,
};
