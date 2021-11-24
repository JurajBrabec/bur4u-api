const uniqueArray = (array) => Array.from(new Set(array)).join(',');

const Days = new Map([
  [1, 'Sunday'],
  [2, 'Monday'],
  [3, 'Tuesday'],
  [4, 'Wednesday'],
  [5, 'Thursday'],
  [6, 'Friday'],
  [7, 'Saturday'],
]);
const Weeks = new Map([
  [1, 'first'],
  [2, 'second'],
  [3, 'third'],
  [4, 'fourth'],
  [5, 'last'],
]);

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

const getWeekend = (calDayOfWeek) => {
  const [day, week] = calDayOfWeek.split(',');
  return `${Days.get(+day)} of ${Weeks.get(+week)} week`;
};

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

const processDailySchedule = (policy, schedule) => {
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
    backupRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Backup')
      : retentionLevel,
    copyRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Duplication')
      : null,
    lastJob,
  };
};

const processMonthlySchedule = (policy, schedule) => {
  const { calDayOfWeek, schedRes } = schedule;
  const { backupType, frequency, retentionLevel } = schedule._;
  const lastJob = getLastJob(jobs, policy, backupType);

  return {
    frequency: frequency,
    calendar: calDayOfWeek,
    copyWeekend: getWeekend(calDayOfWeek),
    backupRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Backup')
      : retentionLevel,
    copyRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Duplication')
      : null,
    lastJob,
  };
};

const processSchedules = (policies, scheduleFilter, scheduleMap) => {
  let result = new Set();
  policies.forEach(({ name, active, schedules }) =>
    schedules
      .filter(scheduleFilter)
      .map((schedule) => scheduleMap(name, schedule))
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

module.exports.configuration = (
  hostName,
  config,
  allPolicies,
  allSlps,
  allJobs
) => {
  policies = allPolicies
    .filter((policy) =>
      policy.clients.find((client) => client.name === hostName)
    )
    .filter((policy) => isDailyPolicy(policy) || isYearlyPolicy(policy))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  const slpNames = new Set(
    policies.reduce((names, policy) => {
      names.push(...policy.schedules.map((schedule) => schedule.schedRes));
      return names;
    }, [])
  );

  slps = allSlps
    .filter((slp) => slpNames.has(slp.slpName))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

  jobs = allJobs
    .filter((job) => job.client === hostName)
    .sort((a, b) => b.started - a.started);

  const response = { config };

  new Set(policies.map((policy) => policy._.policyType)).forEach((type) => {
    response[type] = processPolicies(
      policies.filter((policy) => policy._.policyType === type)
    );
  });

  return response;
};
