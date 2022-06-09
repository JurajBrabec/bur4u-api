const { NBU, make, settings, cached } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    const nbu = await NBU();
    const clients = await nbu.clients();
    const clientsWithConfig = clients.map((client) => {
      client.settings = settings(cached.get(client.name));
      return client;
    });

    res.json(make.Clients(clientsWithConfig.map(make.Client)));
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
