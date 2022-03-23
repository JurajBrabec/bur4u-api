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
  cacheInterval: 60 * 12,
  cacheConcurrency: 4,
  eslInterval: 0,
  eslPath: '.',
  sm9Interval: 0,
  sm9Path: '.',
  sm9History: 60,
  //PROXY entries
  //moduleName: 'proxy',
  providers: [
    {
      addr: 'remotehost:28748',
      api_token: '',
    },
  ],
  queryInterval: 5,
  tsaEnv: 'FT1',
  ui: true,
};
