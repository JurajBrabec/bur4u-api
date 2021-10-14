function writeJSONToFile(fileName, data) {
  const fs = require('fs');
  const crypto = require('crypto');
  const hash = crypto.randomBytes(4).readUInt32LE(0);
  return fs.writeFileSync(`./${fileName}-${hash}.json`, JSON.stringify(data));
}
//writeJSONToFile('response', { allPolicies, allSlps, allJobs, hostName });

function readJSONFromFile(fileName) {
  const fs = require('fs');
  return JSON.parse(fs.readFileSync(fileName));
}
//const response = readJSONFromFile('./response.json');

const saveAllData = async (fileName = 'data') => {
  const { NBU } = require('./modules.js');
  const nbu = await NBU({ bin: 'd:/veritas/netbackup/bin' });
  const [allPolicies, allSlps, allJobs] = await Promise.all([
    nbu.policies(),
    nbu.slps(),
    nbu.jobs(),
  ]);
  writeJSONToFile(fileName, { allPolicies, allSlps, allJobs });
};

const testClient = (hostName) => {
  const { allPolicies, allSlps, allJobs } = readJSONFromFile(
    './tmp/response.json'
  );

  const { configuration } = require('./controllers/api-v1-configuration.js');
  const response = configuration(allPolicies, allSlps, allJobs, hostName);

  console.log(JSON.stringify(response, null, 2));
};

//saveAllData('response');
testClient('plnn1om00p.env01.mcloud.entsvcs.net');
