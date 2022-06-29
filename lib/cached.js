const { readFileSync, writeFileSync } = require('fs');

let CACHE;

if (!CACHE) CACHE = new Map();

module.exports.depot = (depot) => {
  let cache;
  if (CACHE.has(depot)) {
    cache = CACHE.get(depot);
  } else {
    cache = new Map();
    CACHE.set(depot, cache);
  }
  return {
    set: async (name, func, maxAge) => {
      const timeStamp = Date.now();
      if (!cache.has(name) || timeStamp >= cache.get(name).timeStamp + maxAge) {
        const data = await func();
        cache.set(name, { timeStamp, data });
      }
      return cache.get(name).data;
    },
    all: () => cache,
    clear: () => cache.clear(),
    get: (name) => cache.get(name)?.data,
    has: (name) => cache.has(name),
    load: async (fileName) => {
      cache = new Map(JSON.parse(readFileSync(fileName, 'utf-8')));
      CACHE.set(depot, cache);
    },
    save: async (fileName) =>
      writeFileSync(fileName, JSON.stringify([...cache]), 'utf-8'),
    size: () => cache.size,
  };
};

module.exports.all = () => CACHE;
module.exports.clear = () => CACHE.clear();
module.exports.get = (name) => CACHE.get(name);
module.exports.has = (name) => CACHE.has(name);
