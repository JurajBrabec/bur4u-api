const convertOutput = require('../convertOutput.js');
const { value } = require('./nbuFunctions.js');

const retLevelPattern = /^(\d+)\s+(\d+)\s+\(\s*(\d+)\)\s+(.+)$/;

const createRetLevel = (fields) => ({
  level: value.number(fields[0]),
  days: value.number(fields[1]),
  seconds: value.number(fields[2]),
  period: value.string(fields[3]),
});

module.exports = async ({ bin, args = [] }) => {
  const params = {
    path: `${bin}/admincmd/bpretlevel`,
    args: ['-L', ...args],
    delimiter: /\r?\n/,
    filtering: (item) => item.match(/^\d/),
    conversion: (text) => createRetLevel(text.match(retLevelPattern).slice(1)),
  };
  return convertOutput.execute(params);
};
