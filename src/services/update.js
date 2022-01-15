const { watch, rename, readdir, readFile, writeFile } = require('fs/promises');
const { md5File } = require('../modules.js');

const SCRIPTNAME = 'bur4u-api.js';
const UPDATEFOLDER = '.';

let updateTimer;
const DEV = /dev/.test(process.env.npm_lifecycle_event);
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

module.exports.md5 = () => (DEV ? '' : md5File.sync(`./${SCRIPTNAME}`));

module.exports.update = (updateFile) => {
  rename(updateFile, `./${SCRIPTNAME}`)
    .then(() => {
      console.log('Update finished.');
      process.exit(0);
    })
    .catch((error) => console.error(error));
};

module.exports.upload = (prefix, file) => {
  if (file.name !== SCRIPTNAME) throw new Error(`Invalid file name`);
  if (file.md5 === exports.md5()) throw new Error('File has not changed');
  file.mv(`${UPDATEFOLDER}/${prefix}-${file.md5}.update`);
};

module.exports.watch = async (prefix = '') => {
  const pattern = new RegExp(`^${prefix}.+update$`);
  const files = await readdir(UPDATEFOLDER);
  for (const file of files) if (file.match(pattern)) exports.update(file);
  const watcher = watch(UPDATEFOLDER);
  for await (const event of watcher) exports.handle(prefix, event);
  return watcher;
};
