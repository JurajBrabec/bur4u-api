const {
  watch,
  rename,
  readdir,
  readFile,
  writeFile,
  access,
} = require('fs/promises');
const { md5File } = require('../modules.js');

const SCRIPTNAME = 'bur4u-api.js';
const UPDATE_EXITCODE = 1;
const UPDATE_FOLDER = '.';

const DEV = /dev|test/.test(process.env.npm_lifecycle_event);

let updateTimer;
let MD5;

access(`./${SCRIPTNAME}`)
  .then(() => md5File(`./${SCRIPTNAME}`))
  .then((md5) => (MD5 = md5))
  .catch(() => console.log(DEV));

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

module.exports.File = UpdateFile;

module.exports.handle = (prefix, { eventType, filename }) => {
  if (updateTimer) return;
  if (eventType !== 'change') return;
  const pattern = new RegExp(`^${prefix}.+update$`);
  if (!filename.match(pattern)) return;
  updateTimer = setTimeout(() => exports.update(filename), 5000);
};

module.exports.json = async () => {
  const buffer = await readFile(`./${SCRIPTNAME}`, 'utf8');
  const name = SCRIPTNAME;
  const md5 = exports.md5();
  return { buffer, name, md5 };
};

module.exports.md5 = () => MD5;

module.exports.update = (updateFile) => {
  rename(updateFile, `./${SCRIPTNAME}`)
    .then(() => {
      console.log('Update finished.');
      process.exit(UPDATE_EXITCODE);
    })
    .catch((error) => console.error(error));
};

module.exports.upload = (prefix, file) => {
  if (file.name !== SCRIPTNAME) throw new Error(`Invalid file name`);
  if (file.md5 === exports.md5()) throw new Error('File has not changed');
  file.mv(`${UPDATE_FOLDER}/${prefix}-${file.md5}.update`);
};

module.exports.watch = async (prefix = '') => {
  const pattern = new RegExp(`^${prefix}.+update$`);
  const files = await readdir(UPDATE_FOLDER);
  for (const file of files) if (file.match(pattern)) exports.update(file);
  const watcher = watch(UPDATE_FOLDER);
  for await (const event of watcher) exports.handle(prefix, event);
  return watcher;
};
