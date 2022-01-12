const https = require('https');
const { fetch } = require('../modules.js');
const TokenService = require('./tokenService.js');

class TokenServiceAPI extends TokenService {
  static endPoints = new Map([
    ['FT1', 'pln-cd1-apigw-vip.ft1core.mcloud.entsvcs.net'],
    ['FT2', 'pln-ce1-itokenv.ft2core.mcloud.entsvcs.net'],
    ['STAGE', 'tub-crs1-iapig.mcloud.entsvcs.com'],
    ['PROD', 'atcswa-cr-iapig.mcloud.entsvcs.com'],
  ]);
  static environments = new Set(TokenServiceAPI.endPoints.keys());
  static testUsers = new Map([
    ['FT1', { name: 'ngp_bur_user', password: 'tadrur!9-iV_!55I2lFr' }],
    [
      'PROD',
      { name: 'juraj.brabec@dxc.com', password: '5=F42*f*b0samew?tHi$' },
    ],
  ]);
  static isAuthorized = (token) =>
    token.roles.reduce(
      (found, role) => found || role.name === 'bur4u_api_consumer',
      false
    );
  constructor({
    id,
    environment,
    authHeader,
    authSubjectHeader,
    isAuthorized,
    useCache = true,
  } = {}) {
    let endPoint;
    if (TokenServiceAPI.environments.has(environment)) {
      endPoint = TokenServiceAPI.endPoints.get(environment);
    }
    super({ id, endPoint, authHeader, useCache });
    this.environment = environment;
    this.authSubjectHeader = authSubjectHeader;
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
    if (isAuthorized) this.isAuthorized = isAuthorized;
  }
  AuthBody() {
    const { name, password } = TokenServiceAPI.testUsers.get(this.environment);
    return {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              domain: {
                name: 'VPC_Consumer',
              },
              name,
              password,
            },
          },
        },
        scope: {
          project: { name: 'VPC_BUR4U_API', domain: { name: 'VPC_Services' } },
        },
      },
    };
  }
  setEnvironment(environment) {
    if (TokenServiceAPI.environments.has(environment)) {
      this.environment = environment;
      this.endPoint = TokenServiceAPI.endPoints.get(environment);
    }
  }
  Url(hostName) {
    return `https://${hostName}:35357/v3/auth/tokens?nocatalog`;
  }
  async tokenId() {
    return this.fetchTokenId();
  }

  async fetchTokenId() {
    const url = this.Url(this.endPoint);
    const method = 'POST';
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
    };
    const body = JSON.stringify(this.AuthBody());
    const agent = this.agent;
    let id;
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        agent,
      });
      if (response.status !== 201)
        throw new Error(`${response.status} ${response.statusText}`);
      const rawHeaders = response.headers.raw();
      id = rawHeaders[this.authSubjectHeader][0];
    } catch (error) {
      id = { status: 'Error', error: error.message || error };
    }
    return id;
  }
  async fetchToken(id) {
    const url = this.Url(this.endPoint);
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
    };
    headers[this.authHeader] = id;
    headers[this.authSubjectHeader] = id;
    const agent = this.agent;
    const response = await fetch(url, { headers, agent });
    const { status } = response;
    const header =
      status === 200 ? response.headers.raw()[this.authSubjectHeader][0] : null;
    const body = await response.json();
    return { status, header, body };
  }
}

let tokenServiceAPI;
if (!tokenServiceAPI)
  tokenServiceAPI = new TokenServiceAPI({
    id: '2242189293e5412ba71a8f2086a3ef0c',
    environment: 'FT1',
    authHeader: 'x-auth-token',
    authSubjectHeader: 'x-subject-token',
    isAuthorized: TokenServiceAPI.isAuthorized,
    useCache: true,
  });

module.exports = tokenServiceAPI;
