const { Response, Error } = require('./responses-v1.js');

class ClientsResponse extends Response {
  constructor(clients) {
    super();
    this.clients = clients;
  }
}
class ClientDetailResponse extends Response {
  constructor(activeJobs, policies) {
    super();
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
  }
}

class PolicyResponse {
  constructor(policy) {
    this.name = policy.name;
    this.policyType = policy._.policyType;
  }
}

module.exports = {
  Error,
  Client: (data) => new ClientResponse(data),
  ClientHistory: (data) => new ClientHistoryResponse(data),
  ClientDetail: (data1, data2) => new ClientDetailResponse(data1, data2),
  Clients: (data) => new ClientsResponse(data),
  Job: (data) => new JobResponse(data),
  Policy: (data) => new PolicyResponse(data),
};
