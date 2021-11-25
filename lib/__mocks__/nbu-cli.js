const masterServer = 'masterServer.local';
const client = 'test.local';
const clients = [{ name: client, os: 'UX' }];
const config = [{ versionName: '1.0' }];
const jobs = [
  { jobId: 2, state: 1, client, status: null, _: {} },
  { jobId: 1, state: 3, client, status: 0, _: {} },
];
const policies = [
  {
    name: 'TEST',
    clients: [{ name: client }],
    schedules: [
      { name: 'TEST', schedRes: 'TEST', _: { frequency: '24 hours' } },
    ],
    _: { policyType: 'UX' },
  },
];
const slps = [{ slpName: 'TEST', _: {} }];

module.exports = ({ bin } = {}) =>
  Promise.resolve({
    bin,
    masterServer: Promise.resolve(masterServer),
    config: () => Promise.resolve(config),
    clients: () => Promise.resolve(clients),
    jobs: () => Promise.resolve(jobs),
    policies: () => Promise.resolve(policies),
    slps: () => Promise.resolve(slps),
  });
module.exports.masterServer = masterServer;
module.exports.client = client;
