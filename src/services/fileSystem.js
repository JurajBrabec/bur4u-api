const { statSync, utimesSync } = require('fs');
const {
  access,
  appendFile,
  readdir,
  readFile,
  stat,
  unlink,
  rename,
  watch,
  writeFile,
} = require('fs/promises');
const { EOL } = require('os');

const CR = EOL.replace(/\n/, '');

const logRot = async ({ file, time, history = 7 }) => {
  const ts = new Date();
  const [date] = ts.toISOString().split(/T|\./);
  const logRotTs = new Date(`${date} ${time}Z`);
  if (ts < logRotTs) return;
  try {
    const stats = await stat(file);
    if (stats.mtime >= logRotTs) return;
  } catch (e) {
    return;
  }
  console.log('Rotating logs...');
  for (let i = history - 1; i >= 0; i--) {
    const sourceFile = i === 0 ? file : `${file}.${i}`;
    const targetFile = `${file}.${i + 1}`;
    try {
      await unlink(targetFile);
    } catch (e) {
      if (e.errno !== -4058)
        console.log(`Error ${e.errno} deleting file "${targetFile}"`);
    }
    try {
      await rename(sourceFile, targetFile);
    } catch (e) {
      if (e.errno !== -4058)
        console.log(
          `Error ${e.errno} renaming file "${sourceFile}" to "${targetFile}"`
        );
    }
  }
};

module.exports = {
  CR,
  statSync,
  utimesSync,
  access,
  appendFile,
  readdir,
  readFile,
  stat,
  unlink,
  rename,
  watch,
  writeFile,
  logRot,
};
