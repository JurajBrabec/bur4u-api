module.exports = class TokenCache {
  constructor() {
    this.cache = new Map();
  }
  purge() {
    const now = new Date();
    this.cache.forEach((token, id) => {
      if (token.expiresAt < now) this.cache.delete(id);
    });
    return this;
  }
  get(id) {
    this.purge();
    return this.cache.has(id) ? this.cache.get(id) : null;
  }
  set(id, token) {
    const now = new Date();
    return this.cache.set(id, {
      ...token,
      ...{ cached: now },
    });
  }
};
