const { Response, Error } = require('./responses-v1.js');
class ProviderResponse extends Response {
  constructor(provider) {
    super();
    this.name = provider.addr.split(':').shift();
    this.status = provider.status;
    this.data = provider.data;
  }
}

class ProvidersResponse extends Response {
  constructor(providers) {
    super();
    this.providers = providers;
  }
}

class Provider {
  constructor(provider) {
    this.addr = provider.addr;
    this.api_token = provider.api_token;
    this.public_key = provider.public_key;
    this.name = provider.addr.split(':').shift();
    this.status = provider.status;
    this.data = provider.data;
  }
}

module.exports = {
  Error,
  Entry: (data) => new Provider(data),
  Provider: (data) => new ProviderResponse(data),
  Providers: (data) => new ProvidersResponse(data),
};
