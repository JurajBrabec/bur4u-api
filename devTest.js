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

const { allPolicies, allSlps, allJobs, hostName } =
  readJSONFromFile('./response.json');

const { configuration } = require('./controllers/api-v1-configuration.js');

const response = configuration(allPolicies, allSlps, allJobs, hostName);

console.log(JSON.stringify(response, null, 2));
