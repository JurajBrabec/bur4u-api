const { NBU, make, getHostNames } = require('./helpers.js');

module.exports = async (req, res) => {
  try {
    const hostNames = getHostNames(req);
    const nbu = await NBU();
    const jobs = await nbu.jobs({ daysBack: 7 });
    const responses = hostNames.map((hostName) =>
      make.ClientHistory(
        hostName,
        jobs
          .filter((job) => job.state === 3 && job.client === hostName)
          .sort((a, b) => a.jobId > b.jobId)
          .map(make.Job)
      )
    );
    res.json(req.method === 'POST' ? responses : responses[0]);
  } catch (error) {
    res.status(500).json(make.Error(error));
  }
};
