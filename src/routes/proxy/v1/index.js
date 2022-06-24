const { express } = require('../../../modules');
const v1 = require('../../../controllers/proxy/v1');
const tsa = require('../../../services/tsa');

const readAccess = tsa.middleWare((token) =>
  token.roles.find(({ name }) =>
    [tsa.ROLES.read, tsa.ROLES.write].includes(name)
  )
);
const writeAccess = tsa.middleWare((token) =>
  token.roles.find(({ name }) => name === tsa.ROLES.write)
);

const router = express.Router();

router.options(v1.options);
router.use('/token', v1.token);
router.get('/version', v1.version);

router.use('/providers', readAccess);
router.get('/providers', v1.providers);
router.get('/providers/:hostName', v1.provider);

router.use('/clients', readAccess);
router.get('/clients/:hostName/configuration', v1.resolve, v1.proxy);
router.get('/clients/:hostName/history', v1.resolve, v1.proxy);
router.get('/clients/:hostName/status', v1.resolve, v1.proxy);
router.get(
  '/clients/:hostName/status/offline',
  writeAccess,
  v1.resolve,
  v1.proxy
);
router.get(
  '/clients/:hostName/status/online',
  writeAccess,
  v1.resolve,
  v1.proxy
);
router.get('/clients/:hostName', v1.resolve, v1.proxy);
router.get('/clients', v1.resolve, v1.proxy);
router.post('/clients/configuration', v1.resolve, v1.proxy);
router.post('/clients/history', v1.resolve, v1.proxy);
router.post('/clients/status', v1.resolve, v1.proxy);
router.post('/clients/status/offline', writeAccess, v1.resolve, v1.proxy);
router.post('/clients/status/online', writeAccess, v1.resolve, v1.proxy);
router.post('/clients', v1.resolve, v1.proxy);

router.use('/script', writeAccess);
router.post('/script/update', v1.update);

module.exports = router;
