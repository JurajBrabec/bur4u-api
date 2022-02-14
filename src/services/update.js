const formData = require('form-data');
const { readdir, readFile, stat, unlink, watch } = require('fs').promises;
const logger = require('./logger.js');
const { AdmZip } = require('../modules.js');

const EVENT_TYPE = 'change';
const UPDATE_EXITCODE = 1;
const UPDATE_FOLDER = 'tmp';

const DEV = /dev|test/.test(process.env.npm_lifecycle_event);

if (DEV) console.log('DEV MODE');

let onUpdate;
let updateTimer;

const filePattern = () => new RegExp(`^.+\.zip$`);

const cleanUp = async (file) => {
  if (DEV) {
    console.log(`DEV:!Removing "${file}"...`);
  } else {
    await unlink(file);
  }
};

const handle = (moduleName, { eventType, filename }) => {
  if (updateTimer) return;
  if (eventType !== EVENT_TYPE) return;
  if (!filename.match(filePattern())) return;
  updateTimer = setTimeout(() => update(moduleName, filename), 1000);
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

const update = async (moduleName, updateFile) => {
  const source = `${process.cwd()}/${UPDATE_FOLDER}/${updateFile}`;
  const target = DEV ? `${process.cwd()}/${UPDATE_FOLDER}` : process.cwd();
  let restart = false;
  logger.stdout(`Updating ${moduleName} update file "${updateFile}"...`);
  let files = 0;
  try {
    const zip = new AdmZip(source);
    const results = await Promise.all(
      zip.getEntries().map(async (entry) => {
        const { entryName } = entry;
        let method = '';
        try {
          const { size } = await stat(`${process.cwd()}/${entryName}`);
          if (parseInt(entry.header.size) === parseInt(size)) return false;
          method = 'Updated';
        } catch (error) {
          method = 'Added';
        }
        logger.stdout(`${method} "${entryName}"...`);
        zip.extractEntryTo(entry, target, true, true);
        files++;
        return true;
      })
    );
    restart = results.some((result) => result);
  } catch (error) {
    logger.stderr(error.message);
  } finally {
    updateTimer = null;
    if (restart) {
      logger.stdout(`Update finished. ${files} files updated.`);
      process.exit(UPDATE_EXITCODE);
    } else {
      logger.stdout(`No file changed.`);
    }
    if (moduleName === 'proxy') {
      if (!onUpdate) return;
      logger.stdout('Updating providers...');
      const result = await onUpdate(await updateBody(source));
      if (!result) return;
      logger.stdout('Update successful.');
    }
    await cleanUp(source);
  }
};

module.exports.onUpdate = (callback) => {
  onUpdate = callback;
};

module.exports.upload = (file) => {
  if (!file.name.match(filePattern())) throw new Error(`Invalid file name`);
  file.mv(`${UPDATE_FOLDER}/${file.name}`);
};

module.exports.watch = async (moduleName) => {
  const files = await readdir(UPDATE_FOLDER);
  for (const file of files)
    if (file.match(filePattern())) await update(moduleName, file);
  const watcher = watch(UPDATE_FOLDER);
  for await (const event of watcher) handle(moduleName, event);
  return watcher;
};
