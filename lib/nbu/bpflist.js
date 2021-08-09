const convertOutput = require('../convertOutput.js');
const { value } = require('./nbuFunctions.js');

/*
{ image_version: 'number' },
{ client_type: 'number' },
{ dummy1: 'string', ignore: true },
{ dummy2: 'string', ignore: true },
{ dummy3: 'string', ignore: true },
{ dummy4: 'string', ignore: true },
{ dummy5: 'string', ignore: true },
{ dummy6: 'string', ignore: true },
{ dummy7: 'string', ignore: true },
{ dummy8: 'string', ignore: true },
{ dummy9: 'string', ignore: true },
{ start_time: 'number' },
{ timeStamp: 'number' },
{ schedule_type: 'number' },
{ client: 'string' },
{ policy_name: 'string' },
{ backupId: 'string', key: true },
{ dummy10: 'string', ignore: true },
{ peer_name: 'string' },
{ lines: 'number' },
{ options: 'number' },
{ user_name: 'string' },
{ group_name: 'string' },
{ raw_partition_id: 'number' },
{ jobid: 'number' },
{ keyword: 'string', ignore: true },
{ file_number: 'number', key: true },
{ compressed_size: 'number' },
{ path_length: 'number' },
{ data_length: 'number' },
{ block: 'number' },
{ in_image: 'number' },
{ raw_size: 'number' },
{ gb: 'number' },
{ device_number: 'number' },
{ path: 'string' },
{ directory_bits: 'number' },
{ owner: 'string' },
{ group: 'string' },
{ bytes: 'number' },
{ access_time: 'number' },
{ modification_time: 'number' },
{ inode_time: 'number' },
 */
const createFile = (fields) => ({
  name: value.string(fields[0]),
  architecture: value.string(fields[1]),
  os: value.string(fields[2]),
  priority: value.number(fields[3]),
  u1: value.number(fields[4]),
  u2: value.number(fields[5]),
  u3: value.number(fields[6]),
});

const parse = (text) => {
  const COUNT = 17;
  const LENGTH = 2;
  const PATH = 9;
  const NEWLINE = /\r?\n/;
  const DELIMITER = /\r?\n(?=FILES)/;
  const SEPARATOR = ' ';
  const EXPECT = /^FILES \d{2} (0|13|40) /;
  const NULL = '*NULL*';
  let files = text
    .split(DELIMITER)
    .filter((rows) => rows && EXPECT.test(rows))
    .map((rows) => {
      let mainColumns = '';
      return rows
        .split(NEWLINE)
        .filter((row) => row)
        .map((row, i) => {
          let columns = [];
          if (i == 0) {
            mainColumns = row.split(SEPARATOR);
            return columns;
          }
          columns = row.split(SEPARATOR);
          while (
            columns.length >= COUNT &&
            columns[LENGTH] - columns[PATH].length > 1
          ) {
            columns[PATH] += SEPARATOR + columns[PATH + 1];
            columns.splice(PATH + 1, 1);
          }
          if (columns.length < COUNT)
            throw new Error(
              `${columns[PATH].length}!=${columns[LENGTH]} in "${columns[PATH]}"`
            );
          return [...mainColumns, ...columns.slice(0, COUNT)]
            .map((column) => (column === NULL ? null : column))
            .splice(1);
        })
        .splice(1);
    });
  return [files.reduce((result, rows) => result.concat(rows), [])];
};

module.exports = async ({ bin, args = [] }) => {
  const params = {
    path: `${bin}/admincmd/bpflist`,
    args: ['-l', ...args],
    delimiter: /\r?\n/,
    conversion: (text) =>
      createClient(text.split(' ').filter((item) => item !== 'CLIENT')),
  };
  return convertOutput.execute(params);
};
