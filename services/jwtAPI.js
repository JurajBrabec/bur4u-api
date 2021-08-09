const JWT = require('../services/jwt.js');
const { hostname } = require('os');

class JWTAPI extends JWT {
  getToken(req) {
    const claims = this.reqToClaims(req);
    return super.getToken(claims);
  }
  reqToClaims(req) {
    return { sub: req.hostname };
  }
}

module.exports = new JWTAPI({
  claims: { iss: hostname(), aud: 'bur4u-api' },
  secret: 'dxc.technology',
  validYears: 1,
});
