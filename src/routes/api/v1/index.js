const { express } = require('../../../modules');
const jwt = require('../../../services/jwt');
const v1 = require('../../../controllers/api/v1');

const router = express.Router();

router.options(v1.options);
router.use('/token', v1.token);
router.get('/version', v1.version);

router.use('/clients', jwt.middleWare());
router.get('/clients/:hostName/configuration', v1.configuration);
router.get('/clients/:hostName/history', v1.history);
router.get('/clients/:hostName/status', v1.status);
router.get('/clients/:hostName/offline', v1.offline);
router.get('/clients/:hostName/online', v1.online);
router.get('/clients/:hostName', v1.client);
router.get('/clients', v1.clients);
router.post('/clients/status', v1.status);
router.post('/clients/offline', v1.offline);
router.post('/clients/online', v1.online);
router.post('/clients/configuration', v1.configuration);
router.post('/clients/history', v1.history);
router.post('/clients', v1.client);

router.use('/script', jwt.middleWare());
router.post('/script/update', v1.update);

module.exports = router;
