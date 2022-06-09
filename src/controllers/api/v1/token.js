const { make, jwt } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    res.send(jwt.getToken(req));
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
