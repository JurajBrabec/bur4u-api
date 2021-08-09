const path = require('path');
const { statSync } = require('fs');

module.exports.Type = {
  Config: 'conf',
  Bool: 'bool',
  Num: 'num',
  File: 'file',
  Path: 'path',
  String: 'str',
};

const ARG_PREFIX = '-+';
const VALUE_SEPARATORS = '=:';

let configuration = {};

const getDefaultValue = (variable) => {
  let result = configuration[variable.name] || variable.default;
  if (variable.type === exports.Type.Bool && result === undefined)
    result = false;
  return result;
};
const getValue = (value, type, index) => {
  let result = value;
  if (type === exports.Type.Bool && result === undefined) result = true;
  if (result === undefined) result = process.argv[index + 1];
  return result;
};
const castValue = (value, type) => {
  let result = value;
  switch (type) {
    case exports.Type.Num:
      result = parseInt(value);
      break;
    case exports.Type.File:
      result = false;
      if (statSync(value).isFile()) result = path.resolve(value);
      break;
    case exports.Type.Path:
      result = false;
      if (statSync(path.resolve(value)).isDirectory())
        result = path.resolve(value);
      break;
  }
  return result;
};

module.exports.getConfig = () => configuration;

module.exports.importFrom = (fileName) => {
  const external = require(path.resolve(fileName));
  configuration = { ...configuration, ...external };
  return configuration;
};

const parseArg = (variable) => {
  const pattern = new RegExp(
    `^${ARG_PREFIX}(?<arg>${
      variable.arg || variable.name
    })(?:[${VALUE_SEPARATORS}](?<val>.*))?`,
    'i'
  );
  let value = getDefaultValue(variable);
  process.argv.forEach((arg, index) => {
    if (!pattern.test(arg)) return;
    const { val } = arg.match(pattern).groups;
    value = getValue(val, variable.type, index);
  });
  if (value === undefined) return undefined;
  try {
    value = castValue(value, variable.type);
    if (variable.validate) value = variable.validate(value);
    configuration[variable.name] = value;
  } catch (error) {
    throw new Error(`${error.message} in '${variable.arg}' (${value})`);
  }
  return value;
};

module.exports.parseArgs = (variables) => {
  try {
    variables
      .filter((variable) => variable.type === exports.Type.Config)
      .map((variable) => exports.importFrom(parseArg(variable)));
    variables
      .filter((variable) => variable.type !== exports.Type.Config)
      .map((variable) => parseArg(variable));
    return configuration;
  } catch (error) {
    throw new Error(`Parsing error ${error.message}`);
  }
};
