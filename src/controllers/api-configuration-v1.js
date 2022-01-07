const uniqueArray = (array) => Array.from(new Set(array)).join(',');

let policies;
let slps;
let jobs;

const isDailyPolicy = (policy) => !policy.name.match(/(DUMMY|TEMPLATE|_\d+Y_)/);
const isYearlyPolicy = (policy) => policy.name.match(/_\d+Y_/);

const isDailySchedule = (schedule) => schedule._.frequency.match(/\d\d hours/);
const isMonthlySchedule = (schedule) => schedule.calendar === 1;

const getIncludes = (policies) =>
  uniqueArray(policies.map((policy) => policy.include));

const getModel = (backupType) =>
  backupType === 'Full' ? 'Premium' : 'Standard';

const getBackupWindow = (startTimes) =>
  startTimes.match(/^(Any|18|19|20)/) ? '18:00-06:00' : '21:00-09:00';

const getSLPRetention = (slps, name, useFor) =>
  slps.reduce(
    (retention, slp) =>
      slp.slpName === name && slp._.useFor === useFor
        ? slp._.retentionLevel
        : retention,
    null
  );

const getLastJob = (jobs, policy, scheduleType) => {
  const [lastJob] = jobs
    .filter(
      (job) => job.policy === policy && job._.scheduleType === scheduleType
    )
    .sort((a, b) => b.started - a.started);
  if (!lastJob) return null;
  return {
    jobId: lastJob.jobId,
    started: lastJob._.started,
    status: lastJob.status,
  };
};

const processDailySchedule = (policy, res, schedule) => {
  const { schedRes } = schedule;
  const { backupType, frequency, retentionLevel } = schedule._;
  const lastJob = getLastJob(jobs, policy, backupType);

  const startTimes = Array.from(
    new Set([
      schedule._.win_sun_start,
      schedule._.win_mon_start,
      schedule._.win_tue_start,
      schedule._.win_wed_start,
      schedule._.win_thu_start,
      schedule._.win_fri_start,
      schedule._.win_sat_start,
    ])
  ).join(',');

  return {
    model: getModel(backupType),
    frequency: frequency,
    type: backupType,
    encryption: true,
    timeWindow: getBackupWindow(startTimes),
    startTime: startTimes,
    backupRetention:
      getSLPRetention(slps, schedRes || res, 'Backup') || retentionLevel,
    copyRetention:
      getSLPRetention(slps, schedRes || res, 'Duplication') || null,
    lastJob,
  };
};

const processMonthlySchedule = (policy, res, schedule) => {
  const { schedRes } = schedule;
  const { backupType, frequency, retentionLevel, calDates, calDayOfWeek } =
    schedule._;
  const lastJob = getLastJob(jobs, policy, backupType);

  return {
    frequency: frequency,
    calendar: schedule.calDayOfWeek,
    copyWeekend: calDayOfWeek,
    startTime: calDates,
    backupRetention:
      getSLPRetention(slps, schedRes || res, 'Backup') || retentionLevel,
    copyRetention:
      getSLPRetention(slps, schedRes || res, 'Duplication') || null,
    lastJob,
  };
};

const processSchedules = (policies, scheduleFilter, scheduleMap) => {
  let result = new Set();
  policies.forEach(({ name, active, res, schedules }) =>
    schedules
      .filter(scheduleFilter)
      .map((schedule) => scheduleMap(name, res, schedule))
      .map((schedule) =>
        result.add({ state: active ? 'Disabled' : 'Enabled', ...schedule })
      )
  );
  result = Array.from(result);
  if (!result.length) return null;
  return result;
};

const processPolicies = (policies) => {
  return {
    name: policies[0]._.policyType,
    includes: getIncludes(policies),
    daily: processSchedules(
      policies.filter(isDailyPolicy),
      isDailySchedule,
      processDailySchedule
    ),
    monthly: processSchedules(
      policies.filter(isDailyPolicy),
      isMonthlySchedule,
      processMonthlySchedule
    ),
    yearly: processSchedules(
      policies.filter(isYearlyPolicy),
      isMonthlySchedule,
      processMonthlySchedule
    ),
  };
};
module.exports.settings = (config) => (config ? config[0] : {});

module.exports.backupTypes = (hostName, allPolicies, allSlps, allJobs) => {
  policies = allPolicies
    .filter((policy) =>
      policy.clients.find((client) => client.name === hostName)
    )
    .filter((policy) => isDailyPolicy(policy) || isYearlyPolicy(policy))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  const slpNames = new Set(
    policies.reduce((names, policy) => {
      names.push(
        policy.res,
        ...policy.schedules.map((schedule) => schedule.schedRes)
      );
      return names;
    }, [])
  );

  slps = allSlps
    .filter((slp) => slpNames.has(slp.slpName))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  jobs = allJobs
    .filter((job) => job.client === hostName)
    .sort((a, b) => b.started - a.started);

  const backupTypes = [];
  new Set(policies.map((policy) => policy._.policyType)).forEach((type) =>
    backupTypes.push(
      processPolicies(policies.filter((policy) => policy._.policyType === type))
    )
  );
  return backupTypes;
};
