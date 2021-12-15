const timeStamp = () => new Date().toLocaleString('en-GB').replace(', ', '-');

module.exports.stdout = (text) => console.log(timeStamp(), ':', text);
module.exports.stderr = (text) => console.error(timeStamp(), '!', text);
