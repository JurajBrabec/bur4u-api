const { express } = require('../modules.js');
const jwt = require('../services/jwtAPI.js');
const v1 = require('../controllers/api-v1.js');

const router = express.Router();

router.options(v1.options);
router.use('/token', v1.token);

router.use('/clients', jwt.middleWare());
router.get('/clients/:hostName/configuration', v1.configuration);
router.get('/clients/:hostName/history', v1.history);
router.get('/clients/:hostName', v1.client);
router.get('/clients', v1.clients);

router.get('/version', v1.version);
router.get('/md5', v1.md5);
router.post('/update', v1.update);

module.exports = router;
