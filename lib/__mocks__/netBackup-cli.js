const masterServer = 'masterServer.local';
const client = 'test.local';
const clients = [{ name: client, os: 'UX' }];
const jobs = [
  { jobId: 2, state: 1, client, status: null, _: {} },
  { jobId: 1, state: 3, client, status: 0, _: {} },
];
const policies = [
  {
    name: 'TEST',
    clients: [{ name: client }],
    schedules: [{ name: 'TEST', schedRes: 'TEST' }],
    _: {},
  },
];
const slps = [{ slpName: 'TEST', _: {} }];

module.exports = ({ bin, data } = {}) =>
  Promise.resolve({
    bin,
    data,
    masterServer: Promise.resolve(masterServer),
    clients: () => Promise.resolve(clients),
    jobs: () => Promise.resolve(jobs),
    policies: () => Promise.resolve(policies),
    slps: () => Promise.resolve(slps),
  });
module.exports.masterServer = masterServer;
module.exports.client = client;
