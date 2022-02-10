const https = require('https');
const { access, readFile } = require('fs').promises;
const { hostname } = require('os');
const { fetch } = require('../modules.js');

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const CERT_PATH = './cert';
const CERT_FILES = ['.crt', '.key'];
const CERT = `${CERT_PATH}/cert`;
const HOST = `${CERT_PATH}/${hostname()}`;

const findCerts = async (path) => {
  try {
    await Promise.all(CERT_FILES.map((file) => access(path + file)));
    return true;
  } catch {
    return false;
  }
};

module.exports.create = async ({ app, port, callBack }) => {
  let certPath;

  if (await findCerts(CERT)) certPath = CERT;
  if (await findCerts(HOST)) certPath = HOST;
  if (!certPath) throw new Error('No certificates found');

  const [cert, key] = await Promise.all(
    CERT_FILES.map((file) => readFile(certPath + file))
  );
  const options = { cert, key };

  return https.createServer(options, app).listen(port, callBack);
};

module.exports.get = (url, api_token) =>
  fetch(`https://${url}`, {
    agent,
    headers: { Authorization: `Bearer ${api_token}` },
  });

module.exports.post = (url, api_token, body) =>
  fetch(`https://${url}`, {
    agent,
    body,
    headers: {
      Authorization: `Bearer ${api_token}`,
    },
    method: 'POST',
  });
