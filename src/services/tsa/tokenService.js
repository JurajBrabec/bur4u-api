const TokenCache = require('./tokenCache.js');

const dateAddYears = (years) =>
  new Date(new Date().setFullYear(new Date().getFullYear() + years));

module.exports = class TokenService {
  id;
  endPoint;

  constructor({
    id,
    endPoint = 'localhost',
    useCache = true,
    validYears = 1,
    authHeader = 'x-auth-token',
  } = {}) {
    this.id = id;
    if (this.id)
      this._token = this.makeToken({
        id: this.id,
        expires: dateAddYears(validYears),
      });
    this.endPoint = endPoint;
    this.authHeader = authHeader;
    if (useCache) {
      this.cache = new TokenCache();
      if (this._token) this.cache.set(this.id, this._token);
    }
  }
  makeToken({
    id,
    isValid = true,
    issued = new Date(),
    expires = new Date(),
    error,
  } = {}) {
    const token = { id, isValid, issued, expires };
    if (error) {
      token.isValid = false;
      token.error = error.message || error;
      delete token.issued;
      delete token.expires;
    }
    return token;
  }
  Url(hostName = 'localhost') {
    return `https://${hostName}`;
  }

  async fetchTokenId() {
    return this.id;
  }
  async fetchToken(id) {
    const status = 200;
    const header = id;
    const body = {};
    return { status, header, body };
  }

  async token(id) {
    const startTime = Date.now();
    let token;
    try {
      if (!id) throw new Error('token missing');
      if (this.cache) {
        token = this.cache.get(id);
      } else if (id === this.id) {
        token = this._token;
      }
      if (!token) {
        const { status, header, body } = await this.fetchToken(id);
        if (status !== 200) throw body.error;
        if (id !== header) throw new Error('token mismatch');
        token = this.makeToken({
          id,
          issued: new Date(body.token.issued_at),
          expires: new Date(body.token.expires_at),
        });
        if (this.cache) this.cache.set(id, token);
      }
    } catch (error) {
      token = this.makeToken({ id, error });
    }
    token.time = Date.now() - startTime;
    return token;
  }
  middleWare() {
    const func = async (req, res, next) => {
      try {
        const id = req.headers[this.authHeader];
        const token = await this.token(id);
        if (!token.isValid) {
          req.token = token;
          return next();
        }
        res.status(401).send(`Auth error: ${token.error}`);
      } catch (error) {
        res.status(500).send(`Auth error: ${error.message}`);
      }
    };
    return func.bind(this);
  }
};
