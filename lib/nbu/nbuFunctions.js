const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

module.exports.NBUDateTime = (
  value = Date.now(),
  locale = 'en-US',
  hour12 = false
) =>
  new Date(value <= 0 ? Date.now() + value : value)
    .toLocaleString(locale, { hour12 })
    .replace(',', '');

const ISODateTime = (value = Date.now()) =>
  new Date(value - timezoneOffset)
    .toISOString()
    .split('.')
    .shift()
    .replace('T', ' ');

const isNull = (value) =>
  value === '*NULL*' || value === '' || value === undefined;

const secondsToTime = (seconds) => {
  const d = new Date(0);
  d.setSeconds(seconds);
  return d.toISOString().substr(11, 8);
};

module.exports.value = {
  float: (value) => (isNull(value) ? null : parseFloat(value)),
  date: (value) =>
    value === 0 || isNull(value) ? null : ISODateTime(value * 1000),
  time: (value) => (value === 0 || isNull(value) ? null : secondsToTime(value)),
  map: (value, map) => map.get(value) || value,
  number: (value) => (isNull(value) ? null : parseInt(value)),
  string: (value, options) =>
    isNull(value) ? null : value.slice(0, options?.maxLength),
};

module.exports.ISODateTime = ISODateTime;
