const { description, version } = require('../package.json');
const apicache = require('apicache-plus');
const configurator = require('../lib/configurator.js');
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch').default;
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const Cached = require('../lib/cached.js');
const NBU = require('../lib/nbu-cli.js');
const nJwt = require('njwt');
const rfs = require('rotating-file-stream');
const AdmZip = require('adm-zip');

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
};