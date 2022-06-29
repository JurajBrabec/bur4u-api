const { Cron } = require('../modules');

const scheduleJob = (pattern, fn, invoke) => {
  const job = Cron(pattern);
  if (!job.next()) throw new Error('cron job not scheduled');
  job.schedule(fn);
  if (invoke) job.fn();
  return job;
};

module.exports = { scheduleJob, Cron };
