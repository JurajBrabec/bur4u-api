const express = require('express');
const jwt = require('../services/jwtAPI.js');
const v1 = require('../controllers/api-v1.js');

const router = express.Router();

router.use('/token', v1.token);

router.use('/clients', jwt.middleWare());
router.get('/clients', v1.clients);
router.get('/clients/:hostName', v1.client);
router.get('/clients/:hostName/history', v1.history);

module.exports = router;
