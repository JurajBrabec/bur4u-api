const formData = require('form-data');
const {
  statSync,
  utimesSync,
  readdir,
  readFile,
  unlink,
  watch,
  modifyFile,
} = require('./fileSystem.js');
const logger = require('./logger.js');
const { AdmZip, version, DEV } = require('../modules');

const EVENT_TYPE = 'change';
const UPDATE_EXIT_CODE = 3;
const CONFIG_FILE = `${process.cwd()}/conf/bur4u-api.config.js`;
const DIST_FOLDER = `${process.cwd()}/dist`;
const UPDATE_FOLDER = `${process.cwd()}/tmp`;

if (DEV) console.log('DEV MODE');

let onUpdate;
let updateTimer;

module.exports.updateConfigFile = async () => modifyFile(CONFIG_FILE, []);

const filePattern = () => new RegExp(`^.+\.zip$`);

const cleanUp = async (file) => {
  if (DEV) {
    console.log(`DEV:!Removing "${file}"...`);
  } else {
    await unlink(file);
  }
};

const handle = ({ eventType, filename }) => {
  if (updateTimer) return;
  if (eventType !== EVENT_TYPE) return;
  if (!filename.match(filePattern())) return;
  updateTimer = setTimeout(() => update(filename, true), 1000);
};

module.exports.distBody = async (filename = 'dist.zip') => {
  const zip = new AdmZip();
  zip.addLocalFolder(DIST_FOLDER, 'dist');
  const form = new formData();
  form.append('file', zip.toBuffer(), {
    contentType: 'application/octet-stream',
    filename,
  });
  return form;
};

const updateBody = async (filename) => {
  const form = new formData();
  const buffer = await readFile(filename);
  form.append('file', buffer, {
    contentType: 'application/octet-stream',
    filename,
  });
  return form;
};

const update = async (updateFile, force) => {
  const source = `${UPDATE_FOLDER}/${updateFile}`;
  const target = DEV ? `${UPDATE_FOLDER}` : process.cwd();
  logger.stdout(`Update file "${updateFile}" detected...`);
  let files = 0;
  let parentFolder = '';
  try {
    const zip = new AdmZip(source);
    zip.getEntries().forEach((entry) => {
      const { entryName, isDirectory, header } = entry;
      let method = '';
      try {
        const { size, mtime } = statSync(`${process.cwd()}/${entryName}`);
        if (isDirectory) return;
        const hSize = header.size;
        const hDate = new Date(header.time).getTime();
        const date = new Date(mtime).getTime();
        if (!force && hSize === size && hDate <= date) return;
        method = 'Updated';
      } catch (error) {
        if (isDirectory) parentFolder = entryName;
        if (entryName.startsWith(parentFolder)) return;
        method = 'Added';
      }
      logger.stdout(`${method} "${entryName}"...`);
      zip.extractEntryTo(entry, target, true, true);
      utimesSync(`${target}/${entryName}`, header.time, header.time);
      files++;
    });
  } catch (error) {
    logger.stderr(error.message);
  } finally {
    if (files) {
      logger.stdout(`Update finished. ${files} files updated.`);
      process.exit(UPDATE_EXIT_CODE);
    } else {
      logger.stdout(`No file has changed.`);
    }
    if (onUpdate) await onUpdate(() => updateBody(source));
    await cleanUp(source);
    updateTimer = null;
  }
};

module.exports.onUpdate = (callback) => {
  onUpdate = callback;
};

module.exports.upload = (file) => {
  if (!file.name.match(filePattern())) throw new Error(`Invalid file name`);
  file.mv(`${UPDATE_FOLDER}/${file.name}`);
};

module.exports.versionCheck = (providerVersion = version) =>
  version !== providerVersion;

module.exports.check = async () => {
  const files = await readdir(UPDATE_FOLDER);
  for (const file of files)
    if (file.match(filePattern())) await update(file, false);
};

module.exports.watch = async () => {
  const watcher = watch(UPDATE_FOLDER);
  for await (const event of watcher) handle(event);
  return watcher;
};
