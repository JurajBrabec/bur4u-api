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

const modifyFile = async (fileName, changes, newFileName) => {
  const hasKey = (searchKey) => {
    const { line } = matchKey(searchKey);
    return !!line;
  };
  const matchKey = (searchKey) => {
    const valuePattern = (searchValue) =>
      `^  (${searchKey}): (${searchValue}),$`;

    const arrayPattern = new RegExp(
      valuePattern('\\[(?:\\[??[^\\[]*?\\])'),
      'm'
    );
    const simplePattern = new RegExp(valuePattern('.+'), 'm');
    const [line, key, value] =
      file.match(arrayPattern) || file.match(simplePattern) || [];
    return { line, key, value };
  };

  let changed;
  let file = await readFile(fileName, {
    encoding: 'utf8',
  });

  changes.forEach((change) => {
    if (change.add) {
      if (hasKey(change.add)) return;
      const { line, key, value } = matchKey(change.after || change.before);
      if (!line) return;
      let newLine = line.replace(key, change.add).replace(value, change.value);
      if (change.after) newLine = line + EOL + newLine;
      if (change.before) newLine = newLine + EOL + line;
      file = file.replace(line, newLine);
      changed = true;
    }
    if (change.remove) {
      const { line } = matchKey(change.remove);
      if (!line) return;
      file = file.replace(line + EOL, '');
      changed = true;
    }
    if (change.set) {
      const { line, value } = matchKey(change.set);
      if (!line) return;
      const newLine = line.replace(value, change.value);
      if (newLine === line) return;
      file = file.replace(line, newLine);
      changed = true;
    }
  });
  if (!changed) return;
  await writeFile(newFileName || fileName, file);
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
  modifyFile,
};
