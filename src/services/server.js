const https = require('https');
const { readFileSync } = require('fs');
const { fetch } = require('../modules.js');

const agent = new https.Agent({
  rejectUnauthorized: false,
});

module.exports.create = ({ app, port, callBack }) => {
  const options = {
    key: readFileSync('cert/cert.key'),
    cert: readFileSync('cert/cert.crt'),
  };

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
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
