const express = require('express');
const Providers = require('../services/providers.js');
const v1 = require('../controllers/proxy-v1.js');
const tokenService = require('../services/tokenServiceAPI.js');

const router = express.Router();

router.use('/token', v1.token);

router.use('/providers', tokenService.middleWare());
router.get('/providers', v1.providers);
router.get('/providers/:hostName', v1.provider);

router.use('/clients', tokenService.middleWare());
router.get('/clients', Providers.resolve, v1.proxy);
router.get('/clients/:hostName', Providers.resolve, v1.proxy);
router.get('/clients/:hostName/history', Providers.resolve, v1.proxy);

module.exports = router;
