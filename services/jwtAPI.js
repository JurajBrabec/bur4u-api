const JWT = require('../services/jwt.js');

class JWTAPI extends JWT {
  getToken(req) {
    const claims = this.reqToClaims(req);
    return super.getToken(claims);
  }
  reqToClaims(req) {
    return { sub: req.hostname };
  }
  setIssuer(issuer) {
    this.claims.iss = issuer;
  }
}
let jwtAPI;
if (!jwtAPI)
  jwtAPI = new JWTAPI({
    claims: { iss: 'bur4u-api', aud: 'bur4u-api' },
    secret: 'dxc.technology',
    validYears: 1,
  });

module.exports = jwtAPI;
