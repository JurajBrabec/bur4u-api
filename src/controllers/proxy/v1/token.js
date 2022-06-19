const { make, tsa } = require('./helpers.js');

module.exports = async (req, res) => {
  if (req.query.hasOwnProperty('local')) return res.send(tsa.id);
  const { name, password } = req.body;
  try {
    const token = await tsa.fetchTokenId({ name, password });
    res.send(token);
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};
