const URL = '/api/v1';
let token;

const TS_ICON = '🗓';
const PROVIDER_ICON = '🖥';
const CLIENT_ICON = '💻';
const OFFLINE_ICON = '❌';
const ENABLED_ICON = '✅';
const DISABLED_ICON = '🚫';
const STATUS_ICON = '💡';
const HISTORY_ICON = '📊';
const CONFIG_ICON = '⚙';
const VERSION_ICON = '💾';
const TYPE_ICON = '🗃';
const POLICIES_ICON = '🗂';
const JOBS_ICON = '📜';

const set = {
  list: (id, ...children) => {
    const el = getEl(id);
    el.innerHTML = '';
    children.forEach((child) => el.appendChild(child));
    return el;
  },
  text: (id, text = '') => {
    const el = getEl(id);
    el.innerText = text;
    if (id === 'loading' || id === 'error')
      el.parentNode.style.display = text ? 'inline' : 'none';
    return el;
  },
  value: (id, value) => {
    const el = getEl(id);
    el.value = value;
    return el;
  },
};
const getEl = (name) =>
  name instanceof Element ? name : document.getElementById(name);

const getNewEl = (name, children = []) => {
  const params =
    children.length &&
    typeof children[0] === 'object' &&
    !(children[0] instanceof Element)
      ? children.shift()
      : {};
  const el = document.createElement(name);
  if (params) {
    el.className = params.className;
    el.colSpan = params.colSpan;
    if (params.onClick) el.addEventListener('click', params.onClick);
  } else {
    console.log(children);
  }
  children.forEach((child) =>
    child instanceof Element
      ? el.appendChild(child)
      : el.appendChild(document.createTextNode(child))
  );
  return el;
};

const get = {
  el: getEl,
  new: getNewEl,
  list: (...children) => getNewEl('ul', children),
  listItem: (...children) => getNewEl('li', children),
  span: (...children) => getNewEl('span', children),
  table: (...children) => getNewEl('table', children),
  tableHead: (...children) => getNewEl('thead', children),
  headCell: (...children) => getNewEl('th', children),
  tableBody: (...children) => getNewEl('tbody', children),
  row: (...children) => getNewEl('tr', children),
  cell: (...children) => getNewEl('td', children),
  text: (id) => getEl(id).innerText,
  value: (id) => getEl(id).value,
};

get.JSON = async (url) => {
  let data;
  try {
    set.text('error', '');
    set.text('loading', 'Loading...');
    if (!token) {
      const response = await fetch(`${URL}/token?local`);
      if (response.ok) token = await response.text();
    }
    const response = await fetch(url, { headers: { 'x-auth-token': token } });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} ${response.statusText} - ${error}`);
    }
    data = await response.json();
    console.log({ url, data });
  } catch (error) {
    set.text('error', error.message);
  } finally {
    set.text('loading', '');
  }
  return data;
};

get.client = (name, os, settings) =>
  get.listItem(
    settings.product ? CLIENT_ICON : OFFLINE_ICON,
    get.name(name, os)
  );
get.jobId = (jobId) => get.span({ className: 'id' }, jobId);
get.jobStatus = (status) =>
  get.span(
    {
      className: `status-${
        status === 0 ? 'green' : status === 1 ? 'yellow' : 'red'
      }`,
    },
    status
  );
get.name = (name, detail) => {
  const el = get.span({ className: 'name' }, name);
  if (detail || detail === 0)
    el.appendChild(
      get.span(
        { className: 'name' },
        ' (',
        get.span({ className: 'detail' }, detail),
        ')'
      )
    );
  return el;
};
get.policy = (name, type, state) =>
  get.span(
    get.span(state === 'Enabled' ? ENABLED_ICON : DISABLED_ICON),
    get.name(name, type)
  );
get.time = (timeStamp) => new Date(timeStamp);
get.shortTime = (timeStamp) => new Date(timeStamp).toLocaleString('de-DE');
get.timeStamp = (timeStamp = Date.now()) =>
  get.span({ className: 'ts' }, TS_ICON, ' ', get.time(timeStamp));
get.version = ({ product, clientMaster, versionName }) =>
  product
    ? get.listItem(VERSION_ICON, get.name(product, versionName))
    : get.listItem(
        OFFLINE_ICON,
        get.span({ className: 'status-red' }, clientMaster)
      );

get.backupType = (
  name,
  type,
  frequency,
  startTime,
  backupRetention,
  copyRetention,
  lastJob
) =>
  type
    ? get.row(
        get.cell({ classList: 'status-green' }, name),
        get.cell(type),
        get.cell(frequency),
        get.cell(startTime),
        backupRetention
          ? get.cell(backupRetention)
          : get.cell({ className: 'status-red' }, 'N/A'),
        copyRetention
          ? get.cell(copyRetention)
          : get.cell({ className: 'status-yellow' }, 'N/A'),
        lastJob
          ? get.cell(
              {
                className: `status-${
                  lastJob.status === 0
                    ? 'green'
                    : lastJob.status === 1
                    ? 'yellow'
                    : 'red'
                }`,
              },
              get.span(
                lastJob.jobId,
                get.jobStatus(lastJob.status),
                get.shortTime(lastJob.started)
              )
            )
          : get.cell({ className: 'status-red' }, 'N/A')
      )
    : get.row(
        { className: 'status-yellow' },
        get.cell(name),
        get.cell({ className: 'status-red', colSpan: 6 }, 'N/A')
      );
get.backupTypes = ({ daily, monthly, yearly }) =>
  get.table(
    get.tableHead(
      get.row(
        ...[
          'Retention type',
          'Backup type',
          'Frequency',
          'Start time',
          'Backup retention',
          'Copy retention',
          'Last job',
        ].map((title) => get.headCell(title))
      )
    ),
    get.tableBody(
      ...(daily || [{}]).map(
        ({
          type,
          frequency,
          startTime,
          backupRetention,
          copyRetention,
          lastJob,
        }) =>
          get.backupType(
            'Daily',
            type,
            frequency,
            startTime,
            backupRetention,
            copyRetention,
            lastJob
          )
      ),
      ...(monthly || [{}]).map(
        ({ copyWeekend, frequency, backupRetention, copyRetention, lastJob }) =>
          get.backupType(
            'Monthly',
            frequency ? 'Full' : '',
            frequency,
            copyWeekend,
            backupRetention,
            copyRetention,
            lastJob
          )
      ),
      ...(yearly || [{}]).map(
        ({ copyWeekend, frequency, backupRetention, copyRetention, lastJob }) =>
          get.backupType(
            'Yearly',
            frequency ? 'Full' : '',
            frequency,
            copyWeekend,
            backupRetention,
            copyRetention,
            lastJob
          )
      )
    )
  );
get.clients = ({ name, timeStamp, data: { clients } }) =>
  get.listItem(
    PROVIDER_ICON,
    get.name(name, get.timeStamp(timeStamp)),
    get.list(...fillClients(clients))
  );
get.clientConfig = ({ name, timeStamp, data: { settings, backupTypes } }) =>
  get.listItem(
    settings.product ? CLIENT_ICON : OFFLINE_ICON,
    get.name(name, get.timeStamp(timeStamp)),
    get.list(
      get.version(settings),
      get.listItem(
        TYPE_ICON,
        get.name('Backup types', backupTypes.length),
        get.list(...fillBackupTypes(backupTypes))
      )
    )
  );
get.clientStatus = ({
  name,
  timeStamp,
  data: { settings, activeJobs, policies },
}) =>
  get.listItem(
    settings.product ? CLIENT_ICON : OFFLINE_ICON,
    get.name(name, get.timeStamp(timeStamp)),
    get.version(settings),
    get.listItem(
      JOBS_ICON,
      get.name('Active jobs', activeJobs.length),
      fillJobs(activeJobs)
    ),
    get.listItem(
      POLICIES_ICON,
      get.name('Policies', policies.length),
      get.list(...fillPolicies(policies))
    )
  );
get.clientHistory = ({ name, timeStamp, data: { jobs } }) =>
  get.listItem(
    CLIENT_ICON,
    get.name(name, get.timeStamp(timeStamp)),
    get.list(
      get.listItem(
        HISTORY_ICON,
        get.name('History', jobs.length),
        fillJobs(jobs)
      )
    )
  );
get.job = (job) =>
  get.row(
    get.cell(get.jobId(job.jobId)),
    get.cell(job.parentJob),
    get.cell(get.jobStatus(job.status)),
    get.cell(get.name(job.jobType, job.subType)),
    get.cell(get.shortTime(job.started)),
    get.cell(job.elapsed),
    get.cell(get.name(job.policy, job.policyType)),
    get.cell(get.name(job.schedule, job.scheduleType))
  );
get.jobs = (jobs) =>
  get.table(
    get.tableHead(
      get.row(
        ...[
          'Job ID',
          'Parent Job',
          'Status',
          'Type',
          'Started',
          'Elapsed',
          'Policy',
          'Schedule',
        ].map((title) => get.headCell(title))
      )
    ),
    get.tableBody(...jobs.map(get.job))
  );
get.provider = ({ name, status, clients }) =>
  get.listItem(
    { className: 'clickable', onClick: () => read.providerClients(name) },
    PROVIDER_ICON,
    get.name(name, status === 'OK' ? `${clients} clients` : status)
  );

const read = {
  client: (source) => () => source(get.value('name')),
  status: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await get.JSON(`${URL}/clients/${name}`);
      set.value('name', name);
      set.text('client', get.time(timeStamp));
      set.list('clientList', ...providers.map(get.clientStatus));
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
  },
  history: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await get.JSON(
        `${URL}/clients/${name}/history`
      );
      set.value('name', name);
      set.text('client', get.time(timeStamp));
      set.list('clientList', ...providers.map(get.clientHistory));
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
  },
  config: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await get.JSON(
        `${URL}/clients/${name}/configuration`
      );
      set.value('name', name);
      set.text('client', get.time(timeStamp));
      set.list('clientList', ...providers.map(get.clientConfig));
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
  },
  clients: async () => {
    let count = 0;
    try {
      const { timeStamp, providers } = await get.JSON(`${URL}/clients`);
      set.text('clients', get.time(timeStamp));
      set.list('clientsList', ...providers.map(get.clients));
      count = providers.reduce(
        (count, { data: { clients } }) => count + clients.length,
        0
      );
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
    set.value('filter', '');
    set.text('filtered', count);
  },
  providers: async () => {
    try {
      const { timeStamp, providers } = await get.JSON(`${URL}/providers`);
      set.text('providers', get.time(timeStamp));
      set.list('providersList', ...providers.map(get.provider));
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
  },
  providerClients: async (name) => {
    let count = 0;
    try {
      if (!name) throw new Error('Provider name is required');
      const { timeStamp, data } = await get.JSON(`${URL}/providers/${name}`);
      set.text('clients', get.time(timeStamp));
      set.list('clientsList', get.clients({ name, timeStamp, data }));
      count = data.clients.length;
    } catch (error) {
      console.error(error);
      set.text('error', error.message);
    }
    set.value('filter', '');
    set.text('filtered', count);
  },
};

const fillClients = (clients) =>
  clients.map(({ name, os, settings }) =>
    get.listItem(
      { className: 'clickable', onClick: () => read.status(name) },
      get.client(name, os, settings)
    )
  );

const fillPolicies = (policies) =>
  policies.map(({ name, policyType, state }) =>
    get.listItem(get.policy(name, policyType, state))
  );

const fillJobs = (jobs) => (jobs.length ? get.jobs(jobs) : '');

const fillBackupTypes = (backupTypes) =>
  backupTypes.map(({ name, includes, daily, monthly, yearly }) =>
    get.listItem(
      get.name(name, includes),
      get.backupTypes({ daily, monthly, yearly })
    )
  );
const filterClients = () => {
  const filter = get.value('filter').toUpperCase();
  const clients = get.el('clientsList').getElementsByTagName('li');
  let count = 0;
  for (let client of clients) {
    if (!client.classList.contains('clickable')) continue;
    if (!filter || get.text(client).toUpperCase().indexOf(filter) >= 1) {
      client.style.display = 'list-item';
      count++;
    } else {
      client.style.display = 'none';
    }
  }
  set.text('filtered', count);
};

get.el('allProviders').addEventListener('click', read.providers);
get.el('allClients').addEventListener('click', read.clients);
get.el('status').addEventListener('click', read.client(read.status));
get.el('history').addEventListener('click', read.client(read.history));
get.el('config').addEventListener('click', read.client(read.config));
get.el('filter').addEventListener('keyup', filterClients);
