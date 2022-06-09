const { make, get } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    const { hostName } = req.params;
    res.json(
      make.Provider(
        get()
          .filter((provider) => provider.name === hostName)
          .shift()
      )
    );
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};
