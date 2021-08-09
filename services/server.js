const https = require('https');
const { readFileSync } = require('fs');
const fetch = require('node-fetch').default;

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
    headers: { Authorization: `Bearer ${api_token}` },
    agent,
  });
