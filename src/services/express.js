const { apicache, express, cors, morgan, rfs } = require('../modules.js');

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
  if (logPath) {
    app.use(
      morgan('combined', {
        stream: rfs.createStream(`${moduleName}-access.log`, {
          interval: logRotation,
          path: logPath,
        }),
      })
    );
    app.use(
      morgan('combined', {
        skip: (req, res) => res.statusCode < 201,
        stream: rfs.createStream(`${moduleName}-security.log`, {
          interval: '1M',
          maxFiles: 12,
          path: logPath,
        }),
      })
    );
  }
  if (ui) app.use('/ui', express.static('ui'));
  app.use(root, routes);
  app.use((req, res) => res.sendStatus(501));
  return app;
};