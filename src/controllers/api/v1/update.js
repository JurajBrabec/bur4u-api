const { make, update } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    if (!req.files) throw new Error('No files were uploaded.');
    const { file } = req.files;
    await update.upload(file);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};
