const { CR } = require('./fileSystem.js');
const {
  apicache,
  express,
  fileUpload,
  cors,
  morgan,
  rfs,
  DEV,
} = require('../modules.js');

const MORGAN_FORMAT = {
  api:
    '[:date[iso]] :remote-addr :method :url :status :res[content-length] b :response-time ms' +
    CR,
  proxy:
    ':req[x-auth-token] [:date[iso]] :remote-addr :method :url :status :res[content-length] b :response-time ms' +
    CR,
};

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
  app.use(fileUpload({ createParentPath: true }));
  app.use(cors());
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: true, limit: '8mb' }));
  if (logPath) {
    const format = MORGAN_FORMAT[moduleName] || 'combined';
    app.use(
      morgan(format, {
        stream: rfs.createStream(`${moduleName}-access.log`, {
          interval: logRotation,
          path: logPath,
        }),
      })
    );
    app.use(
      morgan(format, {
        skip: (req, res) => res.statusCode < 201,
        stream: rfs.createStream(`${moduleName}-security.log`, {
          interval: '1M',
          maxFiles: 12,
          path: logPath,
        }),
      })
    );
  }
  if (ui) app.use('/ui', express.static(DEV ? 'ui/dist' : 'ui'));
  app.use(root, routes);
  app.use((req, res) => res.sendStatus(501));
  return app;
};
