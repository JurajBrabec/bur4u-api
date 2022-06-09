const { get } = require('./helpers.js');

module.exports = function (req, res, next) {
  const hostNames = [];
  if (req.method === 'GET' && req.params.hostName)
    hostNames.push(req.params.hostName);
  if (req.method === 'POST' && Array.isArray(req.body))
    hostNames.push(...req.body);
  req.providers = get().filter(
    ({ status, data }) =>
      status === 'OK' &&
      (hostNames.length === 0 ||
        hostNames.some((hostName) =>
          data.clients.some(({ name }) => name === hostName)
        ))
  );
  next();
};
