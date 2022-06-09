const { nJwt } = require('../../modules.js');

const dateAddYears = (years) =>
  new Date(new Date().setFullYear(new Date().getFullYear() + years));

module.exports = class JWT {
  constructor({
    claims = { iss: '*', sub: '*', aud: '*' },
    secret = '*',
    validYears = 1,
  } = {}) {
    this.claims = claims;
    this.secret = secret;
    this.validYears = validYears;
  }
  getToken(claims = {}) {
    const effectiveClaims = { ...this.claims, ...claims };
    const token = nJwt.create(effectiveClaims, this.secret);
    delete token.body.jti;
    token.setExpiration(dateAddYears(this.validYears));
    return token.compact();
  }
  validateToken(id, claims = {}) {
    try {
      const { body } = nJwt.verify(id, this.secret);
      const effectiveClaims = { ...this.claims, ...claims };
      let error;
      if (body.iss !== effectiveClaims.iss) error = 'issuer mismatch';
      if (body.sub !== effectiveClaims.sub) error = 'subject mismatch';
      if (body.aud !== effectiveClaims.aud) error = 'audience mismatch';
      if (error) throw new Error(error);
      return { ...{ id, isValid: true }, ...body };
    } catch (error) {
      return { id, isValid: false, error: error.message };
    }
  }
  reqToClaims(req) {
    return {};
  }
  middleWare() {
    const func = async (req, res, next) => {
      let token;
      try {
        let error;
        const auth = req.headers.authorization;
        if (!auth) error = 'authorization header required';
        if (!error && !auth.startsWith('Bearer '))
          error = 'invalid authorization header';
        if (!error) {
          const id = auth.split(' ').pop();
          token = await this.validateToken(id, this.reqToClaims(req));
          if (token.isValid) {
            req.token = token;
            return next();
          } else {
            error = token.error;
          }
        }
        res.status(401).send(`Auth error: ${error}`);
      } catch (error) {
        res.status(500).send(`Auth error: ${error.message}`);
      }
    };
    return func.bind(this);
  }
};
