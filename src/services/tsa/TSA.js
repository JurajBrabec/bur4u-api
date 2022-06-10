const https = require('https');
const { fetch } = require('../../modules');
const TokenService = require('./tokenService.js');

const ENDPOINTS = [
  { instance: 'FT1', endPoint: 'pln-cd1-apigw-vip.ft1core.mcloud.entsvcs.net' },
  { instance: 'FT2', endPoint: 'pln-ce1-itokenv.ft2core.mcloud.entsvcs.net' },
  { instance: 'STAGE', endPoint: 'tub-crs1-iapig.mcloud.entsvcs.com' },
  { instance: 'PROD', endPoint: 'atcswa-cr-iapig.mcloud.entsvcs.com' },
];

const USERS = [
  { instance: 'FT1', name: 'ngp_bur_user', password: 'tadrur!9-iV_!55I2lFr' },
  {
    instance: 'PROD',
    name: 'juraj.brabec@dxc.com',
    password: '5=F42*f*b0samew?tHi$',
  },
];

const OPTIONS = {
  id: '2242189293e5412ba71a8f2086a3ef0c',
  environment: 'PROD',
  authHeader: 'x-auth-token',
  authSubjectHeader: 'x-subject-token',
  useCache: true,
};

class TSA extends TokenService {
  static endPoints = new Map(
    ENDPOINTS.map(({ instance, endPoint }) => [instance, endPoint])
  );
  static environments = new Set(ENDPOINTS.map(({ instance }) => instance));
  static users = new Map(
    USERS.map(({ instance, name, password }) => [instance, { name, password }])
  );
  static isAuthorized = (token, options) =>
    token.roles.reduce(
      (found, role) => found || role.name === options.role,
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
    if (TSA.environments.has(environment)) {
      endPoint = TSA.endPoints.get(environment);
    }
    super({ id, endPoint, authHeader, useCache });
    this.environment = environment;
    this.authSubjectHeader = authSubjectHeader;
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
    if (isAuthorized) this.isAuthorized = isAuthorized;
  }
  AuthBody({ name, password }) {
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
    if (TSA.environments.has(environment)) {
      this.environment = environment;
      this.endPoint = TSA.endPoints.get(environment);
    }
  }
  Url(hostName) {
    return `https://${hostName}:35357/v3/auth/tokens?nocatalog`;
  }

  async fetchTokenId() {
    const url = this.Url(this.endPoint);
    const method = 'POST';
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
    };
    const credentials = TSA.users.get(this.environment);
    if (!credentials) return null;

    const agent = this.agent;
    const body = JSON.stringify(this.AuthBody(credentials));
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

let tokenService;
if (!tokenService) tokenService = new TSA(OPTIONS);

module.exports = tokenService;
