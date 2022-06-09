const { make, get } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    res.json(
      make.Providers(
        get().map((provider) => {
          const { timeStamp, name, status, version } = provider;
          const clients = provider.data?.clients || [];
          return { timeStamp, name, status, version, clients: clients.length };
        })
      )
    );
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};
