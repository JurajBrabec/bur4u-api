const { logRot, readFile, appendFile } = require('./fileSystem.js');
const logger = require('./logger.js');

const FILE = 'mars_mon.log';
const DELIMITER = '\r\n';
const SEPARATOR = '::';
const QUOTE = '';

const FIELDS = {
  date: '',
  severity: 'MAJOR',
  errorCode: '',
  messageText: '',
  eventNode: '',
  eventTypeInstance: 'NBU',
  corellationKey: '',
};

// List of job types allowed for monitoring.
const sm9MonitoredJobTypes = new Set([0, 6, 22, 28]);

// Filtering function for jobs. If function return "true", a ticket is created.
const sm9Failures = (job) => {
  if (job.state !== 3 || job.status === 150 || job.jobType === 17) return false;
  if (job.status === 196) return true;
  return (
    sm9MonitoredJobTypes.has(job.jobType) && job.status > 0 && job.tries > 0
  );
};

// Mapping function for tickets. Data can be modified just before a ticket is created.
const sm9Tickets = (ticket) => {
  ticket.eventTypeInstance = /(^|_)(EAO|P4S)_/.test(ticket.policy)
    ? 'EAO'
    : 'NBU';
  return ticket;
};

const messageText = ({
  policyType,
  jobType,
  policy,
  failure,
  state,
  jobId,
  schedule,
  client,
  errorCode,
  errorText,
}) =>
  `${policyType} ${jobType} policy "${policy}" ${failure}. ${state} with JobID:${jobId} schedule "${schedule}" client ${client} status ${errorCode} (${errorText})`;

const logEntry = ({ masterServer, job }) => ({
  ...FIELDS,
  ...{
    date: job._.ended,
    errorCode: job.status,
    messageText: messageText({
      policyType: job._.policyType || '',
      jobType: job._.jobType,
      policy: job.policy,
      failure: job.status == 196 ? 'Missed' : `${job.tries}.failure`,
      state: job._.state,
      jobId: job.jobId,
      schedule: job.schedule || '',
      client: job.client,
      errorCode: job.status,
      errorText: job._.status,
    }).trim(),
    eventNode: masterServer,
    eventTypeInstance: job.eventTypeInstance,
  },
});

const log = ({ masterServer, jobs }) =>
  jobs
    .reduce(
      (entries, job) => [
        ...entries,
        Object.values(
          logEntry({
            masterServer,
            job,
          })
        )
          .map((field) => [QUOTE, field, QUOTE].join(''))
          .join(SEPARATOR),
      ],
      []
    )
    .join(DELIMITER) + DELIMITER;

const prepareSm9Data = ([failure, jobs, ended]) =>
  jobs
    .filter((job) => job.ended * 1000 >= ended)
    .filter(sm9Failures)
    .sort((a, b) =>
      a.ended === b.ended ? a.jobid - b.jobid : a.ended - b.ended
    )
    .filter(
      (job) =>
        !failure.jobId ||
        job._.ended > failure.ended ||
        (job._.ended === failure.ended && job.jobId !== failure.jobId)
    )
    .map(sm9Tickets);

const getLastFailure = async ({ file }) => {
  let ended, jobId;
  try {
    [_, ended, jobId] = (await readFile(file, { encoding: 'utf8' }))
      .trim()
      .split(/\r?\n/)
      .pop()
      .match(/^(.+?)::.+JobID:(\d+)/);
    jobId = parseInt(jobId);
  } catch (error) {
    ended = null;
    jobId = null;
  }
  logger.stdout(
    `Last exported failure was ${
      jobId ? `#${jobId} @${ended}` : 'not identified'
    }.`
  );
  return { ended, jobId };
};

module.exports = async ({
  nbu,
  outputPath,
  minutes,
  logRotAt = '12:00',
  logRotHistory = 7,
}) => {
  logger.stdout(`SM9 export (for last ${minutes} minutes) started...`);
  const file = `${outputPath}/${FILE}`;
  const masterServer = nbu.masterServer;
  try {
    const jobs = prepareSm9Data(
      await Promise.all([
        getLastFailure({ file }),
        nbu.jobs({ daysBack: 1 }),
        Promise.resolve(Date.now() - minutes * 60 * 1000),
      ])
    );
    if (!jobs.length) {
      logger.stdout(`No failures to export.`);
      return 0;
    }
    if (logRotAt)
      await logRot({ file, time: logRotAt, history: logRotHistory });
    logger.stdout(`Exporting ${jobs.length} failures...`);
    await appendFile(file, log({ masterServer, jobs }));
    logger.stdout(`SM9 export to "${outputPath}" finished.`);
    return 0;
  } catch (error) {
    logger.stderr(
      `Error ${error.code || -1} exporting SM9 file. ${error.message || ''}`
    );
    return 1;
  }
};
