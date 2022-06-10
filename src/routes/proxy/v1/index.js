const { express } = require('../../../modules');
const v1 = require('../../../controllers/proxy/v1');
const tsa = require('../../../services/tsa');

const BASIC_AUTH = { role: 'bur4u_api_consumer' };

const router = express.Router();

router.options(v1.options);
router.use('/token', v1.token);
router.get('/version', v1.version);

router.use('/providers', tsa.middleWare(BASIC_AUTH));
router.get('/providers', v1.providers);
router.get('/providers/:hostName', v1.provider);

router.use('/clients', tsa.middleWare(BASIC_AUTH));
router.get('/clients/:hostName/configuration', v1.resolve, v1.proxy);
router.get('/clients/:hostName/history', v1.resolve, v1.proxy);
router.get('/clients/:hostName', v1.resolve, v1.proxy);
router.get('/clients', v1.resolve, v1.proxy);
router.post('/clients/configuration', v1.resolve, v1.proxy);
router.post('/clients/history', v1.resolve, v1.proxy);
router.post('/clients', v1.resolve, v1.proxy);

router.use('/script', tsa.middleWare(BASIC_AUTH));
router.post('/script/update', v1.update);

module.exports = router;
