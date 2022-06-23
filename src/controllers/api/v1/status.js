const { NBU, make, getHostNames } = require('./helpers.js');

module.exports = (func) => async (req, res) => {
  try {
    const hostNames = getHostNames(req);
    const nbu = await NBU();
    const responses = await Promise.all(
      hostNames.map(async (hostName) => {
        let status;
        switch (func) {
          case 'online':
            status = await nbu.clientOnline({ client: hostName });
            break;
          case 'offline':
            status = await nbu.clientOffline({ client: hostName });
            break;
          default:
            status = await nbu.clientStatus({ client: hostName });
            break;
        }
        const { offlineBackup, offlineRestore } = status[0];
        return make.ClientStatus(hostName, offlineBackup, offlineRestore);
      })
    );
    res.json(req.method === 'POST' ? responses : responses[0]);
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
