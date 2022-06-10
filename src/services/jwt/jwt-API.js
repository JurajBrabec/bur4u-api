const JWT = require('./jwt.js');

const OPTIONS = {
  claims: { iss: 'bur4u-api', aud: 'bur4u-api' },
  secret: 'dxc.technology',
  validYears: 1,
};

class JWT_API extends JWT {
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

let jwt;
if (!jwt) jwt = new JWT_API(OPTIONS);

module.exports = jwt;
