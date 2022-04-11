const { CR } = require('./fileSystem.js');

const timeStamp = () => new Date().toLocaleString('en-GB').replace(', ', '-');

module.exports.stdout = (text) => console.log(timeStamp(), ':', text + CR);
module.exports.stderr = (text) => console.error(timeStamp(), '!', text + CR);
