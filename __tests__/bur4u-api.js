const supertest = require('supertest');
const express = require('../src/services/express.js');

const NBU = require('../lib/nbu-cli.js');
jest.mock('../lib/nbu-cli');

const root = '/api/v1';
const JWTtoken = /eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9./;
const TSAtoken = '2242189293e5412ba71a8f2086a3ef0c';

const { client, masterServer: provider } = NBU;

let request;

const apiResponseToHave = ({ body, arrays }) => {
  expect(body).toHaveProperty('timeStamp');
  expect(typeof body.timeStamp).toBe('number');
  if (arrays)
    Object.keys(arrays).forEach((key) => {
      expect(body).toHaveProperty(key);
      expect(body[key]).toHaveLength(arrays[key]);
    });
};

const proxyResponseToHave = ({
  body,
  providersObject = true,
  providerFields,
  dataArrays,
} = {}) => {
  let responseProvider = body;
  if (typeof body === 'object') {
    expect(body).toHaveProperty('timeStamp');
    expect(typeof body.timeStamp).toBe('number');
    if (providersObject) {
      expect(body).toHaveProperty('providers');
      expect(body.providers).toHaveLength(1);
      responseProvider = body.providers[0];
    }
  }
  if (providerFields.timeStamp !== false) {
    expect(responseProvider).toHaveProperty('timeStamp');
    expect(typeof responseProvider.timeStamp).toBe('number');
  } else {
    delete providerFields.timeStamp;
  }
  expect(responseProvider).toHaveProperty('status');
  expect(responseProvider.status).toBe('OK');
  if (providerFields)
    Object.keys(providerFields).forEach((key) => {
      expect(responseProvider).toHaveProperty(key);
      expect(responseProvider[key]).toBe(providerFields[key]);
    });
  if (dataArrays) {
    expect(responseProvider).toHaveProperty('data');
    apiResponseToHave({ body: responseProvider.data, arrays: dataArrays });
  }
};

describe('API endpoint tests', () => {
  beforeAll(() => {
    const routes = require('../src/routes/api-v1.js');
    const app = express({ root, routes });
    request = supertest(app);
  });

  describe('Without JWT token', () => {
    it('should return 501 on "/" endpoint', () => request.get('/').expect(501));

    it('should return 401 on "/clients" endpoint', async () => {
      const headers = [
        { field: 'Authorization', value: '' }, //no authorization header
        { field: 'Authorization', value: 'Bearer' }, //no bearer token
        { field: 'Authorization', value: 'Bearer invalid' }, //invalid bearer token
      ];
      headers.forEach(async (header) => {
        return request
          .get(`${root}/clients`)
          .set(header.field, header.value)
          .expect(401);
      });
    });

    it('should return 200 and version "/version" endpoint', () =>
      request
        .get(`${root}/version`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('version');
        }));

    it('should return 200 and a JWT token on "/token" endpoint', () =>
      request
        .get(`${root}/token`)
        .expect(200)
        .then((res) => {
          expect(res.text).toMatch(JWTtoken);
        }));
  });

  describe('With JWT token', () => {
    let token;

    beforeAll(() =>
      request
        .get(`${root}/token`)
        .expect(200)
        .then((res) => {
          token = res.text;
        })
    );

    it('should return 200 and Clients on "/clients" endpoint', () =>
      request
        .get(`${root}/clients`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({ body: res.body, arrays: { clients: 1 } })
        ));

    it(`should return 200 and ClientStatus on "/clients/${client}" endpoint`, () =>
      request
        .get(`${root}/clients/${client}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({
            body: res.body,
            arrays: { activeJobs: 1, config: 1, policies: 1 },
          })
        ));

    it(`should return 200 and ClientHistory on "/clients/${client}/history" endpoint`, () =>
      request
        .get(`${root}/clients/${client}/history`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({ body: res.body, arrays: { jobs: 1 } })
        ));

    it(`should return 200 and ClientConfiguration on "/clients/${client}/configuration" endpoint`, () =>
      request
        .get(`${root}/clients/${client}/configuration`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => apiResponseToHave({ body: res.body })));
  });
});

describe('PROXY endpoints tests', () => {
  beforeAll(() => {
    const routes = require('../src/routes/proxy-v1.js');
    const app = express({ root, routes });
    request = supertest(app);
  });

  describe('Without TSA token', () => {
    it('should return 501 on "/" endpoint', () => request.get('/').expect(501));

    it('should return 401 on "/providers" endpoint', async () => {
      const headers = [
        { field: 'X-Auth-Token', value: '' }, // no authorization header
        { field: 'X-Auth-Token', value: 'invalid' }, // invalid authorization header
      ];
      headers.forEach(async (header) => {
        return request
          .get(`${root}/providers`)
          .set(header.field, header.value)
          .expect(401);
      });
    });

    it('should return 200 and version "/version" endpoint', () =>
      request
        .get(`${root}/version`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('version');
        }));

    it('should return 200 and a TSA token on "/token" endpoint', () =>
      request
        .get(`${root}/token?local`)
        .expect(200)
        .then((res) => {
          expect(res.text).toMatch(TSAtoken);
        }));
  });

  describe('With TSA token', () => {
    jest.mock('../src/services/providers.js');
    let token;

    beforeAll(() =>
      request
        .get(`${root}/token?local`)
        .expect(200)
        .then((res) => {
          token = res.text;
        })
    );

    it('should return 200 and Providers on "/providers" endpoint', () =>
      request
        .get(`${root}/providers`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: {
              timeStamp: false,
              name: provider,
              clients: 1,
            },
          })
        ));

    it(`should return 200 and Provider on "/providers/${provider}" endpoint`, () =>
      request
        .get(`${root}/providers/${provider}`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providersObject: false,
            providerFields: { name: provider },
            dataArrays: { clients: 1 },
          })
        ));

    it(`should return 200 and ClientsList on "/clients" endpoint`, () =>
      request
        .get(`${root}/clients`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: { name: provider },
            dataArrays: { clients: 1 },
          })
        ));

    it(`should return 200 and ClientStatus on "/clients/${client}" endpoint`, () =>
      request
        .get(`${root}/clients/${client}`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: { name: provider },
            dataArrays: { activeJobs: 2, policies: 1 },
          })
        ));

    it(`should return 200 and ClientHistory for "/clients/${client}/history" endpoint`, () =>
      request
        .get(`${root}/clients/${client}/history`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: { name: provider },
            dataArrays: { jobs: 2 },
          })
        ));
    it(`should return 200 and ClientConfiguration for "/clients/${client}/configuration" endpoint`, () =>
      request
        .get(`${root}/clients/${client}/configuration`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: { name: provider },
          })
        ));
  });
});
