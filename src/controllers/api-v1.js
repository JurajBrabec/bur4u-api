const { Cached, NBU, version } = require('../modules.js');
const make = require('../models/api-responses-v1.js');
const jwt = require('../services/jwtAPI.js');
const { settings, backupTypes } = require('./api-configuration-v1.js');
const update = require('../services/update.js');

const cached = Cached.depot('config');

module.exports.version = (req, res) => res.status(200).json({ version });

module.exports.options = (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
};

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
    const config = cached.get(hostName);

    res.json(
      make.ClientDetail(
        hostName,
        settings(config),
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
    const clientsWithConfig = clients.map((client) => {
      client.settings = settings(cached.get(client.name));
      return client;
    });

    res.json(make.Clients(clientsWithConfig.map(make.Client)));
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};

module.exports.history = async (req, res) => {
  try {
    const { hostName } = req.params;
    const nbu = await NBU();
    const jobs = await nbu.jobs({ daysBack: 7 });

    res.json(
      make.ClientHistory(
        hostName,
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

module.exports.configuration = async (req, res) => {
  try {
    const { hostName } = req.params;
    const nbu = await NBU();
    const [policies, slps, jobs] = await Promise.all([
      nbu.policies(),
      nbu.slps(),
      nbu.jobs({ daysBack: 7 }),
    ]);
    const config = cached.get(hostName);
    res.json(
      make.ClientConfiguration(
        hostName,
        settings(config),
        backupTypes(hostName, policies, slps, jobs)
      )
    );
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};

module.exports.update = async (req, res) => {
  try {
    if (!req.files) throw new Error('No files were uploaded.');
    const { file } = req.files;
    await update.upload(file);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json(make.Error(error));
  }
};
