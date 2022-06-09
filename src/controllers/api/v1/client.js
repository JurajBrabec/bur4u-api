const { NBU, make, getHostNames, settings, cached } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    const hostNames = getHostNames(req);
    const nbu = await NBU();
    const [jobs, policies] = await Promise.all([
      nbu.jobs({ daysBack: 1 }),
      nbu.policies(),
    ]);
    const responses = hostNames.map((hostName) =>
      make.ClientDetail(
        hostName,
        settings(cached.get(hostName)),
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
    res.json(req.method === 'POST' ? responses : responses[0]);
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
