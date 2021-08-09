const { execFile } = require('child_process');

const _splitOutput = ({ output = '', delimiter = /\r?\n/ }) =>
  output.split(delimiter).map((entry) => entry.trim());

const _filtering = (entry) => entry;

const _conversion = (text = '') => createObject(parseValues(text));

const createObject = (values = []) => ({ text: values });
const parseValues = (text = '') => [text];

module.exports.execute = ({
  path = '',
  args = [],
  options = { encoding: 'utf8', maxBuffer: Infinity },
  delimiter = /\r?\n/,
  filtering = _filtering,
  splitOutput = _splitOutput,
  conversion = _conversion,
}) =>
  new Promise((resolve, reject) => {
    execFile(path, args, options, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr, stdout });
      resolve(
        splitOutput({ output: stdout, delimiter })
          .filter(filtering)
          .map(conversion)
      );
    });
  });

module.exports.read = ({
  delimiter = /\r?\n/,
  splitOutput = _splitOutput,
  conversion = _conversion,
}) =>
  Promise.resolve(splitOutput({ output: stdout, delimiter }).map(conversion));
