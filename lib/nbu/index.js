const { summary, jobs } = require('./bpdbjobs.js');
const clients = require('./bpplclients.js');
const policies = require('./bppllist.js');
const retLevels = require('./bpretlevel.js');
const { ISODateTime, NBUDateTime } = require('./nbuFunctions.js');

var _instance = undefined;

const getMasterServerName = async ({ bin }) => {
  const result = await summary({ bin });
  const { masterServer } = result[0];
  return masterServer;
};

const _main = async ({ bin, data } = {}) => {
  if (!_instance)
    _instance = {
      bin,
      data,
      masterServer: getMasterServerName({ bin }),
      clients: () => clients({ bin }),
      jobs: ({ client, daysBack, raw } = { raw: false }) => {
        const args = [];
        if (client) args.push('-client', client);
        if (daysBack)
          args.push('-t', NBUDateTime(-daysBack * 24 * 60 * 60 * 1000));
        return jobs({ bin, args, raw });
      },
      policies: ({ raw } = { raw: false }) => policies({ bin, raw }),
      retLevels: () => retLevels({ bin }),
      summary: () => summary({ bin }),
    };
  return _instance;
};

_main.ISODateTime = ISODateTime;
_main.NBUDateTime = NBUDateTime;

module.exports = _main;
