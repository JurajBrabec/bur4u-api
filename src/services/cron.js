const { Cron } = require('../modules.js');

const scheduleJob = (pattern, fn) => {
  const job = Cron(pattern);
  if (!job.next()) throw new Error('cron job not scheduled');
  job.schedule(fn);
  job.fn();
  return job;
};

module.exports = { scheduleJob, Cron };
