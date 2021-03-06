const supertest = require('supertest');
const express = require('../src/services/express.js');

const NBU = require('../lib/nbu-cli.js');
jest.mock('../lib/nbu-cli');

const path = '/api/v1';
const JWTtoken = /eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9./;
const TSAtoken = '2242189293e5412ba71a8f2086a3ef0c';

const { client, masterServer: provider } = NBU;

let request;

const apiResponseToHave = ({ body, arrays, fields }) => {
  expect(body).toHaveProperty('timeStamp');
  expect(typeof body.timeStamp).toBe('number');
  if (fields)
    Object.keys(fields).forEach((key) => {
      expect(body).toHaveProperty(key);
      expect(typeof body[key]).toBe(fields[key]);
    });
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
    const routes = require('../src/routes/api/v1');
    const app = express({ routes: [{ path, routes }] });
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
          .get(`${path}/clients`)
          .set(header.field, header.value)
          .expect(401);
      });
    });

    it('should return 200 and version "/version" endpoint', () =>
      request
        .get(`${path}/version`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('version');
        }));

    it('should return 200 and a JWT token on "/token" endpoint', () =>
      request
        .get(`${path}/token`)
        .expect(200)
        .then((res) => {
          expect(res.text).toMatch(JWTtoken);
        }));
  });

  describe('With JWT token', () => {
    let token;

    beforeAll(() =>
      request
        .get(`${path}/token`)
        .expect(200)
        .then((res) => {
          token = res.text;
        })
    );

    it('should return 200 and Clients on "/clients" endpoint', () =>
      request
        .get(`${path}/clients`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({ body: res.body, arrays: { clients: 1 } })
        ));

    it(`should return 200 and ClientStatus on "/clients/${client}" endpoint`, () =>
      request
        .get(`${path}/clients/${client}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({
            body: res.body,
            fields: { settings: 'object' },
            arrays: { activeJobs: 1, policies: 1 },
          })
        ));

    it(`should return 200 and ClientHistory on "/clients/${client}/history" endpoint`, () =>
      request
        .get(`${path}/clients/${client}/history`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({ body: res.body, arrays: { jobs: 1 } })
        ));

    it(`should return 200 and ClientConfiguration on "/clients/${client}/configuration" endpoint`, () =>
      request
        .get(`${path}/clients/${client}/configuration`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) =>
          apiResponseToHave({
            body: res.body,
            fields: { settings: 'object' },
            arrays: { backupTypes: 1 },
          })
        ));
  });
});

describe('PROXY endpoints tests', () => {
  beforeAll(() => {
    const routes = require('../src/routes/proxy/v1');
    const app = express({ routes: [{ path, routes }] });
    request = supertest(app);
  });

  describe('Without TSA token', () => {
    it('should return 501 on "/" endpoint', () => request.get('/').expect(501));

    it('should return 401 on "/providers" endpoint', () =>
      request.get(`${path}/providers`).set('X-Auth-Token', '').expect(401));

    it('should return 200 and version "/version" endpoint', () =>
      request
        .get(`${path}/version`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('version');
        }));

    it('should return 200 and a TSA token on "/token" endpoint', () =>
      request
        .get(`${path}/token?local`)
        .expect(200)
        .then((res) => {
          expect(res.text).toMatch(TSAtoken);
        }));
  });

  describe('With TSA token', () => {
    jest.mock('../src/services/proxy.js');
    let token;

    beforeAll(() =>
      request
        .get(`${path}/token?local`)
        .expect(200)
        .then((res) => {
          token = res.text;
        })
    );

    it('should return 200 and Providers on "/providers" endpoint', () =>
      request
        .get(`${path}/providers`)
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
        .get(`${path}/providers/${provider}`)
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
        .get(`${path}/clients`)
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
        .get(`${path}/clients/${client}`)
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
        .get(`${path}/clients/${client}/history`)
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
        .get(`${path}/clients/${client}/configuration`)
        .set('X-Auth-Token', token)
        .expect(200)
        .then((res) =>
          proxyResponseToHave({
            body: res.body,
            providerFields: { name: provider },
            dataArrays: { backupTypes: 1 },
          })
        ));
  });
});
