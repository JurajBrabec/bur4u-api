const make = require('../models/api-responses-v1.js');

let policies;
let slps;
let jobs;

const isDailyPolicy = (policy) => policy.name.match(/_\d+D_/);
const isYearlyPolicy = (policy) => policy.name.match(/_\d+Y_/);

const isDailySchedule = (schedule) => schedule.frequency.match(/\d\d hours/);
const isMonthlySchedule = (schedule) => schedule.calendar === 1;

const getIncludes = (policies) =>
  Array.from(new Set(policies.map((policy) => policy.include))).join(',');

const getModel = (backupType) =>
  backupType === 'Full' ? 'Premium' : 'Standard';

const getBackupWindow = (startTimes) =>
  startTimes.match(/^(Any|18|19|20)/) ? '18:00-06:00' : '21:00-09:00';

const getWeekend = (calDayOfWeek) =>
  calDayOfWeek.match(/7,5/) ? 'Last' : 'Other';

const getSLPRetention = (slps, name, useFor) =>
  slps.reduce(
    (retention, slp) =>
      slp.name === name && slp.useFor === useFor ? slp.retention : retention,
    null
  );

const getLastJob = (jobs, policy, schedule) => {
  const lastJob = jobs
    .filter((job) => job.policy === policy && job.schedule === schedule)
    .pop();
  if (!lastJob) return null;
  return {
    jobId: lastJob.jobId,
    started: lastJob._.started,
    status: lastJob.status,
  };
};

const processDailySchedule = (policy, schedule) => {
  const { name, backupType, frequency, schedRes, retention } = schedule;
  const lastJob = getLastJob(jobs, policy, name);

  const startTimes = Array.from(
    new Set([
      schedule.win_sun_start,
      schedule.win_mon_start,
      schedule.win_tue_start,
      schedule.win_wed_start,
      schedule.win_thu_start,
      schedule.win_fri_start,
      schedule.win_sat_start,
    ])
  ).join(',');

  return {
    model: getModel(backupType),
    frequency: frequency,
    type: backupType,
    encryption: true,
    timeWindow: getBackupWindow(startTimes),
    backupRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Backup')
      : retention,
    copyRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Duplication')
      : null,
    lastJob,
  };
};

const processMonthlySchedule = (policy, schedule) => {
  const { name, frequency, calDayOfWeek, schedRes, retention } = schedule;
  const lastJob = getLastJob(jobs, policy, name);

  return {
    frequency: frequency,
    calendar: calDayOfWeek,
    copyWeekend: getWeekend(calDayOfWeek),
    backupRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Backup')
      : retention,
    copyRetention: schedRes
      ? getSLPRetention(slps, schedRes, 'Duplication')
      : null,
    lastJob,
  };
};

const processSchedules = (policies, scheduleFilter, scheduleMap) => {
  let result = new Set();
  policies.forEach(({ name, schedules }) =>
    schedules
      .filter(scheduleFilter)
      .map((schedule) => scheduleMap(name, schedule))
      .map((schedule) => result.add(schedule))
  );
  result = Array.from(result);
  if (!result.length) return null;
  if (result.length === 1) result = result[0];
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

module.exports.configuration = (allPolicies, allSlps, allJobs, hostName) => {
  policies = allPolicies
    .filter((policy) =>
      policy.clients.find((client) => client.name === hostName)
    )
    .filter((policy) => isDailyPolicy(policy) || isYearlyPolicy(policy))
    .sort((a, b) => a.name < b.name)
    .map(make.Policy);

  const slpNames = new Set(
    policies.reduce((names, policy) => {
      names.push(...policy.schedules.map((schedule) => schedule.schedRes));
      return names;
    }, [])
  );

  slps = allSlps
    .filter((slp) => slpNames.has(slp.slpName))
    .sort((a, b) => a.name < b.name)
    .map(make.SLP);

  jobs = allJobs
    .filter((job) => job.client === hostName)
    .sort((a, b) => a.started > b.started);

  const response = {};

  new Set(policies.map((policy) => policy.policyType)).forEach((type) => {
    response[type] = processPolicies(
      policies.filter((policy) => policy.policyType === type)
    );
  });

  return response;
};
