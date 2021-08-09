const convertOutput = require('../convertOutput.js');
const { value } = require('./nbuFunctions.js');
const jobOperations = require('./jobOperations.js');
const jobStates = require('./jobStates.js');
const jobSubtypes = require('./jobSubtypes.js');
const jobTypes = require('./jobTypes.js');
const policyTypes = require('./policyTypes.js');
const scheduleTypes = require('./scheduleTypes.js');
const statusTexts = require('./statusTexts.js');

const summaryPattern = new RegExp(
  [
    'Summary of jobs on (\\S+)',
    'Queued:\\s+(\\d+)',
    'Waiting-to-Retry:\\s+(\\d+)',
    'Active:\\s+(\\d+)',
    'Successful:\\s+(\\d+)',
    'Partially Successful:\\s+(\\d+)',
    'Failed:\\s+(\\d+)',
    'Incomplete:\\s+(\\d+)',
    'Suspended:\\s+(\\d+)',
    'Total:\\s+(\\d+)',
  ].join('\\r?\\n')
);

const createSummary = (values) => ({
  masterServer: value.string(values[0]),
  queued: value.number(values[1]),
  waiting: value.number(values[2]),
  active: value.number(values[3]),
  successful: value.number(values[4]),
  partial: value.number(values[5]),
  failed: value.number(values[6]),
  incomplete: value.number(values[7]),
  suspended: value.number(values[8]),
  total: value.number(values[9]),
});

const createJob = (values) => ({
  jobId: value.number(values[0]),
  jobType: value.number(values[1]),
  state: value.number(values[2]),
  status: value.number(values[3]),
  policy: value.string(values[4]),
  schedule: value.string(values[5]),
  client: value.string(values[6]),
  server: value.string(values[7]),
  started: value.number(values[8]),
  elapsed: value.number(values[9]),
  ended: value.number(values[10]),
  stUnit: value.string(values[11]),
  tries: value.number(values[12]),
  operation: value.string(values[13]),
  kBytes: value.number(values[14]),
  files: value.number(values[15]),
  pathLastWritten: value.string(values[16]),
  percent: value.number(values[17]),
  jobPid: value.number(values[18]),
  owner: value.string(values[19]),
  subType: value.number(values[20]),
  policyType: value.number(values[21]),
  scheduleType: value.number(values[22]),
  priority: value.number(values[23]),
  group: value.string(values[24]),
  masterServer: value.string(values[25]),
  retentionLevel: value.number(values[26]),
  retentionPeriod: value.number(values[27]),
  compression: value.number(values[28]),
  kBytesToBeEritten: value.number(values[29]),
  filesToBeEritten: value.number(values[30]),
  fileListCount: value.number(values[31]),
  tryCount: value.number(values[32]),
  parentJob: value.number(values[33]),
  kbPerSec: value.number(values[34]),
  copy: value.number(values[35]),
  robot: value.string(values[36]),
  vault: value.string(values[37]),
  profile: value.string(values[38]),
  session: value.string(values[39]),
  ejectTapes: value.string(values[40]),
  srcStUnit: value.string(values[41]),
  srcServer: value.string(values[42]),
  srcMedia: value.string(values[43]),
  dstMedia: value.string(values[44]),
  stream: value.number(values[45]),
  suspendable: value.number(values[46]),
  resumable: value.number(values[47]),
  restartable: value.number(values[48]),
  datamovement: value.number(values[49]),
  snapshot: value.number(values[50]),
  backupId: value.string(values[51]),
  killable: value.number(values[52]),
  controllingHost: value.number(values[53]),
  offHostType: value.number(values[54]),
  ftUsage: value.number(values[55]),
  reasonString: value.string(values[56], { maxLength: 128 }),
  dedupRatio: value.float(values[57]),
  accelerator: value.number(values[58]),
  instanceDbName: value.string(values[59]),
  rest1: value.string(values[60]),
  rest2: value.string(values[61]),
});

const computeJob = (job) => ({
  ...job,
  ...{
    _: {
      jobType: value.map(job.jobType, jobTypes),
      state: value.map(job.state, jobStates),
      status: value.map(job.status, statusTexts),
      started: value.date(job.started),
      elapsed: value.time(job.elapsed),
      ended: value.date(job.ended),
      operation: value.map(job.operation, jobOperations),
      subType: value.map(job.subType, jobSubtypes),
      policyType: value.map(job.policyType, policyTypes),
      scheduleType: value.map(job.scheduleType, scheduleTypes),
    },
  },
});

module.exports.summary = async ({ bin, args = [] }) => {
  const params = {
    path: `${bin}/admincmd/bpdbjobs`,
    args: ['-summary', '-l', ...args],
    delimiter: /(\r?\n){2}/,
    conversion: (text) => createSummary(text.match(summaryPattern).slice(1)),
  };
  return convertOutput.execute(params);
};

module.exports.jobs = async ({ bin, args = [], raw = false }) => {
  const params = {
    path: `${bin}/admincmd/bpdbjobs`,
    args: ['-report', '-most_columns', ...args],
    delimiter: /\r?\n/,
    conversion: (text) => createJob(text.split(',')),
  };
  const jobs = await convertOutput.execute(params);
  return raw ? jobs : jobs.map(computeJob);
};
