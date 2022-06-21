const https = require('https');
const { fetch } = require('../../modules');
const TokenService = require('./tokenService.js');

const ENDPOINTS = [
  { instance: 'FT1', endPoint: 'pln-cd1-apigw-vip.ft1core.mcloud.entsvcs.net' },
  { instance: 'FT2', endPoint: 'pln-ce1-itokenv.ft2core.mcloud.entsvcs.net' },
  { instance: 'STAGE', endPoint: 'tub-crs1-iapig.mcloud.entsvcs.com' },
  { instance: 'PROD', endPoint: 'atcswa-cr-iapig.mcloud.entsvcs.com' },
];

const ROLES = { read: 'bur4u_api_consumer', write: 'bur4u_api_admin' };

const OPTIONS = {
  environment: 'PROD',
  authHeader: 'x-auth-token',
  authSubjectHeader: 'x-subject-token',
  useCache: true,
};

const LOCAL_USER = {
  id: '2242189293e5412ba71a8f2086a3ef0c',
  roles: [ROLES.read, ROLES.write],
};

class TSA extends TokenService {
  static endPoints = new Map(
    ENDPOINTS.map(({ instance, endPoint }) => [instance, endPoint])
  );
  static environments = new Set(ENDPOINTS.map(({ instance }) => instance));
  constructor({
    id,
    environment,
    authHeader,
    authSubjectHeader,
    roles,
    useCache = true,
  } = {}) {
    let endPoint;
    if (TSA.environments.has(environment)) {
      endPoint = TSA.endPoints.get(environment);
    }
    super({ id, endPoint, authHeader, useCache, roles });
    this.environment = environment;
    this.authSubjectHeader = authSubjectHeader;
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
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

  async fetchTokenId({ name, password } = {}) {
    const agent = this.agent;
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
    };
    const method = 'POST';
    const url = this.Url(this.endPoint);
    let id;
    try {
      if (!name) throw new Error('No name provided');
      const body = JSON.stringify(this.AuthBody({ name, password }));
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
      //      id = { status: 'Error', error: error.message || error };
      throw new Error(error);
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
  middleWare(isAuthorized) {
    const func = async (req, res, next) => {
      try {
        const id = req.headers[this.authHeader];
        const token = await this.token(id);
        if (!token.isValid)
          return res.status(401).send(`Auth error: ${token.error}`);
        if (isAuthorized && !isAuthorized(token))
          return res.status(402).send(`Auth error: Not authorized`);
        req.token = token;
        return next();
      } catch (error) {
        res.status(500).send(`Auth error: ${error.message}`);
      }
    };
    return func.bind(this);
  }
}

let tokenService;
const options = { ...OPTIONS, ...LOCAL_USER };
if (!tokenService) tokenService = new TSA(options);

module.exports = tokenService;
module.exports.ROLES = ROLES;
