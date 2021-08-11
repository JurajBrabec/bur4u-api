const NBU = require('../lib/netBackup-cli.js');
const make = require('../models/api-responses-v1.js');
const jwt = require('../services/jwtAPI.js');

module.exports.token = async (req, res) => {
  try {
    res.send(jwt.getToken(req));
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};

module.exports.client = async (req, res) => {
  try {
    const { hostName } = req.params;
    const nbu = await NBU();
    const [jobs, policies] = await Promise.all([
      nbu.jobs({ daysBack: 1 }),
      nbu.policies(),
    ]);

    res.json(
      make.ClientDetail(
        jobs
          .filter((job) => job.state === 1 && job.client === hostName)
          .sort((a, b) => a.jobId > b.jobId)
          .map(make.Job),
        policies
          .filter((policy) =>
            policy.clients.reduce((found, client) => {
              if (client.name === hostName) found = true;
              return found;
            }, false)
          )
          .sort((a, b) => a.name < b.name)
          .map(make.Policy)
      )
    );
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};

module.exports.clients = async (req, res) => {
  try {
    const nbu = await NBU();
    const clients = await nbu.clients();

    res.json(make.Clients(clients.map(make.Client)));
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};

module.exports.history = async (req, res) => {
  try {
    const { hostName } = req.params;
    const nbu = await NBU();
    const jobs = await nbu.jobs();

    res.json(
      make.ClientHistory(
        jobs
          .filter((job) => job.state === 3 && job.client === hostName)
          .sort((a, b) => a.jobId > b.jobId)
          .map(make.Job)
      )
    );
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
