module.exports = {
  cacheTime: 15,
  logPath: 'log',
  logRotation: '1d',
  //API related entries
  moduleName: 'api',
  port: 28748,
  nbuBinPath: 'c:/program files/veritas/netbackup/bin',
  nbuDataPath: 'c:/programdata/veritas/netbackup',
  cacheCron: '0 */8 * * *',
  cacheConcurrency: 4,
  eslCron: null,
  eslPath: '.',
  //PROXY related entries
  moduleName: 'proxy',
  port: 443,
  providers: [
    // {
    //   addr: 'remotehost:28748',
    //   api_token: '',
    // },
  ],
  queryCron: '*/5 * * * *',
  ui: true,
};
