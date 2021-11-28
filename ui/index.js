const URL = '/api/v1';
let token;

const TS_ICON = String.fromCodePoint(9201);
const PROVIDER_ICON = String.fromCodePoint(128737);
const CLIENT_ICON = String.fromCodePoint(128187);
const STATUS_ICON = String.fromCodePoint(128270);
const HISTORY_ICON = String.fromCodePoint(128200);
const CONFIG_ICON = String.fromCodePoint(9881);
const VERSION_ICON = String.fromCodePoint(128192);
const TYPE_ICON = String.fromCodePoint(128197);
const POLICIES_ICON = String.fromCodePoint(127359);
const JOBS_ICON = String.fromCodePoint(128450);

const fetchJSON = async (url) => {
  let response;
  set.text('error', '');
  set.text('loading', 'Loading...');
  if (!token) {
    response = await fetch(`${URL}/token?local`);
    if (response.ok) token = await response.text();
  }
  response = await fetch(url, { headers: { 'x-auth-token': token } });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${error}`);
  }
  set.text('loading', '');
  const data = await response.json();
  console.log({ url, data });
  return data;
};

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
  const el = document.createElement(name);
  children.forEach((child) =>
    child instanceof Element
      ? el.appendChild(child)
      : el.appendChild(document.createTextNode(child))
  );
  return el;
};

const get = {
  el: getEl,
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

get.client = (name, os) => get.listItem(CLIENT_ICON, get.name(name, os));
get.jobId = (jobId, parentJob) => {
  const el = get.span(
    parentJob !== jobId && parentJob ? `${parentJob}-${jobId}` : `${jobId}`
  );
  el.classList.add('id');
  return el;
};
get.jobStatus = (status) => {
  const el = get.span(status);
  el.classList.add(
    `status-${status === 0 ? 'green' : status === 1 ? 'yellow' : 'red'}`
  );
  return el;
};
get.name = (name, detail) => {
  const el = get.span(name);
  el.classList.add('name');
  if (detail || detail === 0) {
    const el2 = get.span(detail);
    el2.classList.add('detail');
    const el1 = get.span(' (', el2, ')');
    el1.classList.add('name');
    el.appendChild(el1);
  }
  return el;
};
get.policy = (name, type, state) => {
  const el1 = get.span(state);
  el1.classList.add(`status-${state === 'Enabled' ? 'green' : 'red'}`);
  return get.span(el1, get.name(name, type));
};
get.time = (timeStamp) => TS_ICON + ' ' + new Date(timeStamp);
get.timeStamp = (timeStamp = Date.now()) => {
  const el = get.span(get.time(timeStamp));
  el.classList.add('ts');
  return el;
};
get.backupType = (
  name,
  type,
  frequency,
  startTime,
  backupRetention,
  copyRetention,
  lastJob
) => {
  let row;
  const nameCell = get.cell(name);
  if (type) {
    nameCell.classList.add('status-green');
    const brCell = get.cell(backupRetention || 'N/A');
    const crCell = get.cell(copyRetention || 'N/A');
    backupRetention || brCell.classList.add('status-red');
    copyRetention || crCell.classList.add('status-yellow');
    const lj = lastJob
      ? get.jobId(lastJob.jobId) +
        get(monthly.lastJob.status) +
        `<span class="ts">@${monthly.lastJob.started}</span>`
      : 'N/A';
    const ljCell = get.cell(lj);
    lastJob || ljCell.classList.add('status-red');
    row = get.row(
      nameCell,
      get.cell(type),
      get.cell(frequency),
      get.cell(startTime),
      brCell,
      crCell,
      ljCell
    );
  } else {
    const cell = get.cell('N/A');
    cell.classList.add('status-red');
    cell.setAttribute('colSpan', '6');
    row = get.row(nameCell, cell);
    row.classList.add('status-yellow');
  }
  return row;
};
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
get.clientConfig = ({
  name,
  timeStamp,
  data: {
    settings: { product, versionName },
    backupTypes,
  },
}) => {
  const el = get.listItem(
    CLIENT_ICON,
    get.name(name, get.timeStamp(timeStamp))
  );
  el.appendChild(
    get.list(
      get.listItem(VERSION_ICON, get.name(product, versionName)),
      get.listItem(
        TYPE_ICON,
        get.name('Backup types', backupTypes.length),
        get.list(...fillBackupTypes(backupTypes))
      )
    )
  );
  return el;
};
get.clientStatus = ({
  name,
  timeStamp,
  data: {
    settings: { product, versionName },
    activeJobs,
    policies,
  },
}) => {
  const el = get.listItem(
    CLIENT_ICON,
    get.name(name, get.timeStamp(timeStamp))
  );
  el.appendChild(
    get.list(
      get.listItem(VERSION_ICON, get.name(product, versionName)),
      get.listItem(
        JOBS_ICON,
        get.name('Active jobs', activeJobs.length),
        get.list(...fillJobs(activeJobs))
      ),
      get.listItem(
        POLICIES_ICON,
        get.name('Policies', policies.length),
        get.list(...fillPolicies(policies))
      )
    )
  );
  return el;
};
get.clientHistory = ({ name, timeStamp, data: { jobs } }) => {
  const el = get.listItem(
    CLIENT_ICON,
    get.name(name, get.timeStamp(timeStamp))
  );
  el.appendChild(
    get.list(
      get.listItem(
        HISTORY_ICON,
        get.name('History', jobs.length),
        get.list(...fillJobs(jobs))
      )
    )
  );
  return el;
};
get.provider = ({ name, status, clients }) => {
  const detail = status === 'OK' ? `${clients} clients` : status;
  const el = get.listItem(PROVIDER_ICON, get.name(name, detail));
  el.classList.add('clickable');
  el.addEventListener('click', () => read.providerClients(name));
  return el;
};

const read = {
  client: (source) => () => source(get.value('name')),
  status: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await fetchJSON(
        `${URL}/clients/${name}`
      );
      set.text('client', get.time(timeStamp));
      set.value('name', name);
      set.list('clientList', ...providers.map(get.clientStatus));
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
  },
  history: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await fetchJSON(
        `${URL}/clients/${name}/history`
      );
      set.text('client', get.time(timeStamp));
      set.value('name', name);
      set.list('clientList', ...providers.map(get.clientHistory));
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
  },
  config: async (name) => {
    try {
      if (!name) throw new Error('Client name is required');
      const { timeStamp, providers } = await fetchJSON(
        `${URL}/clients/${name}/configuration`
      );
      set.text('client', get.time(timeStamp));
      set.value('name', name);
      set.list('clientList', ...providers.map(get.clientConfig));
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
  },
  clients: async () => {
    let count = 0;
    try {
      const { timeStamp, providers } = await fetchJSON(`${URL}/clients`);
      set.text('clients', get.time(timeStamp));
      set.list('clientsList', ...providers.map(get.clients));
      count = providers.reduce(
        (count, { data: { clients } }) => count + clients.length,
        0
      );
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
    set.value('filter', '');
    set.text('filtered', count);
  },
  providers: async () => {
    try {
      const { timeStamp, providers } = await fetchJSON(`${URL}/providers`);
      set.text('providers', get.time(timeStamp));
      set.list('providersList', ...providers.map(get.provider));
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
  },
  providerClients: async (name) => {
    let count = 0;
    try {
      if (!name) throw new Error('Provider name is required');
      const { timeStamp, data } = await fetchJSON(`${URL}/providers/${name}`);
      set.text('clients', get.time(timeStamp));
      set.list('clientsList', get.clients({ name, timeStamp, data }));
      count = data.clients.length;
    } catch (error) {
      console.log(error);
      set.text('error', error.message);
    }
    set.value('filter', '');
    set.text('filtered', count);
  },
};

const fillClients = (clients) =>
  clients.map(({ name, os }) => {
    const el = get.listItem(get.client(name, os));
    el.classList.add('clickable');
    el.addEventListener('click', () => read.status(name));
    return el;
  });

const fillJobs = (jobs) =>
  jobs.map((job) => {
    const el = get.listItem(
      get.jobId(job.jobId, job.parentJob),
      get.jobStatus(job.status)
    );
    return el;
    // `${formatJobId(job.jobId, job.parentJob)}
    // ${formatJobStatus(job.status)}
    // <span>${job.jobType} ${job.subType} ${job.state}</span>
    // @<span class="ts">${job.started} (${job.elapsed})</span>
    // ${formatClient(job.policy, job.policyType)}
    // / ${formatClient(job.schedule, job.scheduleType)}`
  });

const fillPolicies = (policies) =>
  policies.map(({ name, policyType, state }) => {
    const el = get.listItem(get.policy(name, policyType, state));
    return el;
  });

const fillBackupTypes = (backupTypes) =>
  backupTypes.map(({ name, includes, daily, montlhy, yearly }) => {
    const el = get.listItem(
      get.name(name, includes),
      get.backupTypes({ daily, montlhy, yearly })
    );
    return el;
  });

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
