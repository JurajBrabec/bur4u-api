const {
  watch,
  rename,
  readdir,
  readFile,
  writeFile,
  access,
} = require('fs/promises');
const { md5File } = require('../modules.js');

const EVENT_TYPE = 'change';
const SCRIPT_NAME = 'bur4u-api.js';
const UPDATE_EXITCODE = 1;
const UPDATE_FOLDER = '.';

const DEV = /dev|test/.test(process.env.npm_lifecycle_event);

let updateTimer;
let MD5;

access(`./${SCRIPT_NAME}`)
  .then(() => md5File(`./${SCRIPT_NAME}`))
  .then((md5) => (MD5 = md5))
  .catch(() => console.log('DEV:', DEV));

class UpdateFile {
  constructor({ name, buffer, md5 }) {
    this.buffer = buffer;
    this.name = name;
    this.md5 = md5;
  }
  mv(path) {
    return writeFile(path, this.buffer);
  }
}

const fileName = (prefix, name) => `${prefix}-${name}.update`;
const filePattern = (prefix) => new RegExp(`^${fileName(prefix, '.+')}$`);

module.exports.File = UpdateFile;

module.exports.handle = (prefix, { eventType, filename }) => {
  if (updateTimer) return;
  if (eventType !== EVENT_TYPE) return;
  if (!filename.match(filePattern(prefix))) return;
  updateTimer = setTimeout(() => exports.update(filename), 5000);
};

module.exports.json = async () => {
  const buffer = await readFile(`./${SCRIPT_NAME}`, 'utf8');
  const name = SCRIPT_NAME;
  const md5 = exports.md5();
  return { buffer, name, md5 };
};

module.exports.md5 = () => MD5;

module.exports.update = (updateFile) => {
  rename(updateFile, `./${SCRIPT_NAME}`)
    .then(() => {
      console.log('Update finished.');
      process.exit(UPDATE_EXITCODE);
    })
    .catch((error) => console.error(error));
};

module.exports.upload = (prefix, file) => {
  if (file.name !== SCRIPT_NAME) throw new Error(`Invalid file name`);
  if (file.md5 === exports.md5()) throw new Error('File has not changed');
  file.mv(`${UPDATE_FOLDER}/${fileName(prefix, file.md5)}`);
};

module.exports.watch = async (prefix = '') => {
  const files = await readdir(UPDATE_FOLDER);
  for (const file of files)
    if (file.match(filePattern(prefix))) exports.update(file);
  const watcher = watch(UPDATE_FOLDER);
  for await (const event of watcher) exports.handle(prefix, event);
  return watcher;
};
