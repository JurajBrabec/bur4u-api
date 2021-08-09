const convertOutput = require('../convertOutput.js');
const { value } = require('./nbuFunctions.js');

const createClient = (fields) => ({
  name: value.string(fields[0]),
  architecture: value.string(fields[1]),
  os: value.string(fields[2]),
  priority: value.number(fields[3]),
  u1: value.number(fields[4]),
  u2: value.number(fields[5]),
  u3: value.number(fields[6]),
});

module.exports = async ({ bin, args = [] }) => {
  const params = {
    path: `${bin}/admincmd/bpplclients`,
    args: ['-allunique', '-l', ...args],
    delimiter: /\r?\n/,
    conversion: (text) =>
      createClient(text.split(' ').filter((item) => item !== 'CLIENT')),
  };
  return convertOutput.execute(params);
};
