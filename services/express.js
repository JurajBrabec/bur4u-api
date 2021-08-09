const apicache = require('apicache-plus');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

module.exports = ({
  moduleName,
  cacheTime,
  logPath,
  logRotation,
  root,
  routes,
  ui,
}) => {
  const app = express();
  if (cacheTime) app.use(apicache(cacheTime));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (logPath)
    app.use(
      morgan('combined', {
        stream: rfs.createStream(`${moduleName}-access.log`, {
          interval: logRotation,
          path: logPath,
        }),
      })
    );
  if (ui) app.use('/ui', express.static('ui'));
  app.use(root, routes);
  app.use((req, res) => res.sendStatus(401));
  return app;
};
