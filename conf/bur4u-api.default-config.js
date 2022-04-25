module.exports = {
  cacheTime: 15,
  logPath: 'log',
  logRotation: '1d',
  port: 28748,
  //API entries
  //moduleName: 'api',
  nbuBinPath: 'c:/program files/veritas/netbackup/bin',
  nbuDataPath: 'c:/programdata/veritas/netbackup',
  cacheCron: '0 */8 * * *',
  cacheConcurrency: 4,
  eslCron: null,
  eslPath: '.',
  //PROXY entries
  //moduleName: 'proxy',
  providers: [
    {
      addr: 'remotehost:28748',
      api_token: '',
    },
  ],
  queryCron: '*/5 * * * *',
  ui: true,
};
