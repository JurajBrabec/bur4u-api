module.exports = {
  cacheTime: 15,
  logPath: 'log',
  logRotation: '1d',
  port: 28748,
  //API entries
  //module: 'api',
  nbuBinPath: 'c://program files//veritas//netbackup//bin',
  //PROXY entries
  //module: 'proxy',
  providers: [
    {
      addr: 'remotehost:28748',
      api_token: '',
    },
  ],
  queryInterval: 60,
  ui: true,
};
