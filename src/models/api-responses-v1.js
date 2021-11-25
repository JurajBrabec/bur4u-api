const { Response, Error } = require('./responses-v1.js');

class ClientsResponse extends Response {
  constructor(clients) {
    super();
    this.clients = clients;
  }
}
class ClientDetailResponse extends Response {
  constructor(config, activeJobs, policies) {
    super();
    this.settings = config;
    this.activeJobs = activeJobs;
    this.policies = policies;
  }
}

class ClientHistoryResponse extends Response {
  constructor(jobs) {
    super();
    this.jobs = jobs;
  }
}

class ClientConfigurationResponse extends Response {
  constructor(configuration) {
    super();
    this.configuration = configuration;
  }
}

class ClientResponse {
  constructor(client) {
    this.name = client.name;
    this.architecture = client.architecture;
    this.os = client.os;
  }
}

class JobResponse {
  constructor(job) {
    this.jobId = job.jobId;
    this.parentJob = job.parentJob;
    this.status = job.status;
    this.jobType = job._.jobType;
    this.subType = job._.subType;
    this.state = job._.state;
    this.policy = job.policy;
    this.policyType = job._.policyType;
    this.schedule = job.schedule;
    this.scheduleType = job._.scheduleType;
    this.started = job._.started;
    this.elapsed = job._.elapsed;
    this.retention = job._.retentionLevel;
  }
}

class ScheduleResponse {
  constructor(schedule) {
    this.name = schedule.name;
    this.backupType = schedule._.backupType;
    this.frequency = schedule._.frequency;
    this.retention = schedule._.retentionLevel;
    this.calendar = schedule.calendar;
    this.copies = schedule.copies;
    this.calDayOfWeek = schedule.calDayOfWeek;
    this.schedRes = schedule.schedRes;
    this.schedRL = schedule.schedRL;
    this.win_sun_start = schedule._.win_sun_start;
    this.win_sun_duration = schedule._.win_sun_duration;
    this.win_mon_start = schedule._.win_mon_start;
    this.win_mon_duration = schedule._.win_mon_duration;
    this.win_tue_start = schedule._.win_tue_start;
    this.win_tue_duration = schedule._.win_tue_duration;
    this.win_wed_start = schedule._.win_wed_start;
    this.win_wed_duration = schedule._.win_wed_duration;
    this.win_thu_start = schedule._.win_thu_start;
    this.win_thu_duration = schedule._.win_thu_duration;
    this.win_fri_start = schedule._.win_fri_start;
    this.win_fri_duration = schedule._.win_fri_duration;
    this.win_sat_start = schedule._.win_sat_start;
    this.win_sat_duration = schedule._.win_sat_duration;
  }
}
class PolicyResponse {
  constructor(policy) {
    this.name = policy.name;
    this.state = policy.active ? 'Disabled' : 'Enabled';
    this.backupCopy = policy.backupCopy;
    this.backupCopies = policy.backupCopies;
    this.res = policy.res;
    this.include = policy.include;
    this.policyType = policy._.policyType;
    this.jobSubtype = policy._.jobSubtype;
    this.clients = policy.clients;
    this.schedules = policy.schedules.map(
      (schedule) => new ScheduleResponse(schedule)
    );
  }
}

class SLPResponse {
  constructor(slp) {
    this.name = slp.slpName;
    this.operationIndex = slp.operationIndex;
    this.useFor = slp._.useFor;
    this.retention = slp._.retentionLevel;
    this.window = slp.slpWindow;
    this.storageUnit = slp.storageUnit;
  }
}

module.exports = {
  Error,
  Client: (data) => new ClientResponse(data),
  ClientHistory: (data) => new ClientHistoryResponse(data),
  ClientDetail: (data1, data2, data3) =>
    new ClientDetailResponse(data1, data2, data3),
  ClientConfiguration: (data) => new ClientConfigurationResponse(data),
  Clients: (data) => new ClientsResponse(data),
  Job: (data) => new JobResponse(data),
  Policy: (data) => new PolicyResponse(data),
  SLP: (data) => new SLPResponse(data),
};
