const convertOutput = require('../convertOutput.js');
const { value } = require('./nbuFunctions.js');
const policyTypes = require('./policyTypes.js');
const scheduleTypes = require('./scheduleTypes.js');
const jobSubtypes = require('./jobSubtypes.js');

const createPolicy = (values) => ({
  name: value.string(values.CLASS[0]),
  internalname: value.string(values.CLASS[1]),
  options: value.number(values.CLASS[2]),
  protocolversion: value.number(values.CLASS[3]),
  timeZoneOffset: value.number(values.CLASS[4]),
  auditReason: value.string(values.CLASS[5]),
  policyType: value.number(values.INFO[0]),
  followNfsMount: value.number(values.INFO[1]),
  clientCompress: value.number(values.INFO[2]),
  jobPriority: value.number(values.INFO[3]),
  proxyClient: value.string(values.INFO[4]),
  clientEncrypt: value.number(values.INFO[5]),
  dr: value.number(values.INFO[6]),
  maxJobsPerClient: value.number(values.INFO[7]),
  crossMountPoints: value.number(values.INFO[8]),
  maxFragSize: value.number(values.INFO[9]),
  active: value.number(values.INFO[10]),
  tir: value.number(values.INFO[11]),
  blockLevelIncrementals: value.number(values.INFO[12]),
  extSecInfo: value.number(values.INFO[13]),
  individualFileRestore: value.number(values.INFO[14]),
  streaming: value.number(values.INFO[15]),
  frozenImage: value.number(values.INFO[16]),
  backupCopy: value.number(values.INFO[17]),
  effectiveDate: value.number(values.INFO[18]),
  classId: value.string(values.INFO[19]),
  backupCopies: value.number(values.INFO[20]),
  checkPoints: value.number(values.INFO[21]),
  checkPointInterval: value.number(values.INFO[22]),
  unused: value.number(values.INFO[23]),
  instantRecovery: value.number(values.INFO[24]),
  offHostBackup: value.number(values.INFO[25]),
  alternateClient: value.number(values.INFO[26]),
  dataMover: value.number(values.INFO[27]),
  dataMoverType: value.number(values.INFO[28]),
  bmr: value.number(values.INFO[29]),
  lifeCycle: value.number(values.INFO[30]),
  granularRestore: value.number(values.INFO[31]),
  jobSubtype: value.number(values.INFO[32]),
  vm: value.number(values.INFO[33]),
  ignoreCsDedup: value.number(values.INFO[34]),
  exchangeDbSource: value.number(values.INFO[35]),
  generation: value.number(values.INFO[36]),
  applicationDiscovery: value.number(values.INFO[37]),
  discoveryLifeTime: value.number(values.INFO[38]),
  fastBackup: value.number(values.INFO[39]),
  optimizedBackup: value.number(values.INFO[40]),
  clientListType: value.number(values.INFO[41]),
  selectListType: value.number(values.INFO[42]),
  appConsistent: value.number(values.INFO[43]),
  Key: value.string(values.KEY),
  res: value.string(values.RES[0]),
  pool: value.string(values.POOL[0]),
  foe: value.string(values.FOE[0]),
  shareGroup: value.string(values.SHAREGROUP),
  dataClassification: value.string(values.DATACLASSIFICATION),
  hypervServer: value.string(values.HYPERVSERVER),
  names: value.string(values.NAMES),
  bcmd: value.string(values.BCMD),
  rcmd: value.string(values.RCMD),
  applicationDefined: value.string(values.APPLICATIONDEFINED),
  oraBkupDataFileArgs: value.string(values.ORABKUPDATAFILEARGS),
  oraBkupArchLogArgs: value.string(values.ORABKOPARCHLOGARGS),
  include: value.string(values.INCLUDE.join(',')),
  clients: values.CLIENT.map((client) => ({
    name: value.string(client[0]),
    architecture: value.string(client[1]),
    os: value.string(client[2]),
    field1: value.number(client[3]),
    field2: value.number(client[4]),
    field3: value.number(client[5]),
    field4: value.number(client[6]),
  })),
  schedules: values.SCHED.map((sched) => ({
    name: value.string(sched.SCHED[0]),
    backupType: value.number(sched.SCHED[1]),
    multiplexingCopies: value.number(sched.SCHED[2]),
    frequency: value.number(sched.SCHED[3]),
    retentionLevel: value.number(sched.SCHED[4]),
    reserved1: value.number(sched.SCHED[5]),
    reserved2: value.number(sched.SCHED[6]),
    reserved3: value.number(sched.SCHED[7]),
    alternateReadServer: value.string(sched.SCHED[8]),
    maxFragmentSize: value.number(sched.SCHED[9]),
    calendar: value.number(sched.SCHED[10]),
    copies: value.number(sched.SCHED[11]),
    foe: value.number(sched.SCHED[12]),
    synthetic: value.number(sched.SCHED[13]),
    pfiFastRecover: value.number(sched.SCHED[14]),
    priority: value.number(sched.SCHED[15]),
    storageService: value.number(sched.SCHED[16]),
    checksumDetection: value.number(sched.SCHED[17]),
    calDates: value.string(sched.SCHEDCALDATES[0]),
    calRetries: value.string(sched.SCHEDCALENDAR[0]),
    calDayOfWeek: value.string(sched.SCHEDCALDAYOWEEK[0]),
    win_sun_start: value.number(sched.SCHEDWIN[0]),
    win_sun_duration: value.number(sched.SCHEDWIN[1]),
    win_mon_start: value.number(sched.SCHEDWIN[2]),
    win_mon_duration: value.number(sched.SCHEDWIN[3]),
    win_tue_start: value.number(sched.SCHEDWIN[4]),
    win_tue_duration: value.number(sched.SCHEDWIN[5]),
    win_wed_start: value.number(sched.SCHEDWIN[6]),
    win_wed_duration: value.number(sched.SCHEDWIN[7]),
    win_thu_start: value.number(sched.SCHEDWIN[8]),
    win_thu_duration: value.number(sched.SCHEDWIN[9]),
    win_fri_start: value.number(sched.SCHEDWIN[10]),
    win_fri_duration: value.number(sched.SCHEDWIN[11]),
    win_sat_start: value.number(sched.SCHEDWIN[12]),
    win_sat_duration: value.number(sched.SCHEDWIN[13]),
    schedRes: value.string(sched.SCHEDRES[0]),
    schedPool: value.string(sched.SCHEDPOOL[0]),
    schedRL: value.string(sched.SCHEDRL[0]),
    schedFoe: value.string(sched.SCHEDFOE[0]),
    schedSg: value.string(sched.SCHEDSG[0]),
  })),
});

const computePolicy = (policy) => ({
  ...policy,
  ...{
    _: {
      policyType: value.map(policy.policyType, policyTypes),
      jobSubtype: value.map(policy.jobSubtype, jobSubtypes),
    },
    schedules: policy.schedules.map((schedule) => ({
      ...schedule,
      ...{ _: { backupType: value.map(schedule.backupType, scheduleTypes) } },
    })),
  },
});

const parseValues = (text) => {
  const simpleReducer = (object, line) => {
    const items = line.split(' ');
    const key = items.shift();
    object[key] = items;
    return object;
  };

  let match;
  let pattern;
  let row = { CLASS: [], INFO: [], RES: [], POOL: [], FOE: [] };
  //ARRAY items
  pattern = /^(CLASS|INFO|RES|POOL|FOE) ?(.+)?$/gm;
  match = text.match(pattern) || [];
  match.reduce(simpleReducer, row);
  //LINE items
  pattern =
    /^(NAMES|KEY|BCMD|RCMD|SHAREGROUP|DATACLASSIFICATION|APPLICATIONDEFINED|HYPERVSERVER|ORABKUPDATAFILEARGS|ORABKOPARCHLOGARGS) ?(.+)?$/gm;
  match = text.match(pattern) || [];
  match.reduce((object, line) => {
    const i = line.indexOf(' ');
    const key = i > 0 ? line.slice(0, i) : line;
    const item = i > 0 ? line.slice(i + 1) : undefined;
    object[key] = item;
    return object;
  }, row);
  //MULTI-LINE items
  row.INCLUDE = [];
  pattern = /^INCLUDE ?(.+)?$/gm;
  match = text.match(pattern) || [];
  match.reduce((object, line) => {
    const items = line.split(' ');
    const key = items.shift();
    object[key].push(...items);
    return object;
  }, row);
  //MULTI-ARRAY items
  row.CLIENT = [];
  pattern = /^CLIENT ?(.+)?$/gm;
  match = text.match(pattern) || [];
  match.reduce((object, line) => {
    const items = line.split(' ');
    const key = items.shift();
    object[key].push(items);
    return object;
  }, row);
  //MULTI-MULTI-ARRAY items
  row.SCHED = [];
  pattern =
    /^SCHED(CALDATES|CALENDAR|CALDAYOFWEEK|WIN|RES|POOL|RL|FOE|DSG)? ?(.+)?$/gm;
  text
    .split(/^(?=SCHED )/gm)
    .slice(1)
    .reduce((object, schedule) => {
      const scheduleMatch = schedule.match(pattern) || [];
      const sched = scheduleMatch.reduce(simpleReducer, {
        SCHED: [],
        SCHEDCALDATES: [],
        SCHEDCALENDAR: [],
        SCHEDCALDAYOWEEK: [],
        SCHEDWIN: [],
        SCHEDRES: [],
        SCHEDPOOL: [],
        SCHEDRL: [],
        SCHEDFOE: [],
        SCHEDSG: [],
      });
      object.SCHED.push(sched);
      return object;
    }, row);
  return row;
};

module.exports = async ({ bin, args = [], raw = false }) => {
  const params = {
    path: `${bin}/admincmd/bppllist`,
    args: ['-allpolicies', ...args],
    delimiter: /(\r?\n(?=CLASS))/,
    conversion: (text) => createPolicy(parseValues(text)),
  };
  const policies = await convertOutput.execute(params);
  return raw ? policies : policies.map(computePolicy);
};
