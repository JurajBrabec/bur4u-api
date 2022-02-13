module.exports = {
  cacheTime: 15,
  logPath: 'log',
  logRotation: '1d',
  port: 28748,
  //API entries
  //moduleName: 'api',
  nbuBinPath: 'c://program files//veritas//netbackup//bin',
  domain: null,
  user: null,
  password: null,
  cacheInterval: 60 * 60 * 12,
  cacheConcurrency: 4,
  //PROXY entries
  //moduleName: 'proxy',
  providers: [
    {
      addr: 'remotehost:28748',
      api_token: '',
    },
  ],
  queryInterval: 60,
  tsaEnv: 'FT1',
  ui: true,
};
