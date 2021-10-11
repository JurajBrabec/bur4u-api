const URL = '/api/v1';
let token;

const fetchJSON = async (url) => {
  let response;
  setLabel('error', '');
  if (!token) {
    //    response = await fetch(`${URL}/token`);
    response = await fetch(`${URL}/token?local`);
    if (response.ok) token = await response.text();
  }
  response = await fetch(url, { headers: { 'x-auth-token': token } });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${error}`);
  }
  return response.json();
};

const formatTimeStamp = (timeStamp) =>
  `@<span class="ts">${new Date(timeStamp)}</span>`;

const formatPolicy = (name, type, state) =>
  `<span class="client">${name} (<span class="detail">${type}</span>)
  </span><span class="${
    state === 'Enabled' ? 'status-green' : 'status-red'
  }">${state}</span>`;

const formatClient = (name, detail) =>
  `<span class="client">${name} (<span class="detail">${detail}</span>)</span>`;

const formatJobStatus = (status) =>
  `<span class="${
    status === 0
      ? 'status-green'
      : status === 1
      ? 'status-yellow'
      : 'status-red'
  }">${status}</span>`;

const formatJobId = (jobId, parentJob) =>
  `<span class="id">${
    parentJob !== jobId && parentJob ? `${parentJob}-${jobId}` : `${jobId}`
  }</span>`;

const setLabel = (id, text) => (document.getElementById(id).innerHTML = text);

const createList = (el) => {
  const ul = document.createElement('ul');
  el && ul.appendChild(el);
  return ul;
};

const getList = (id) => {
  const li = document.getElementById(id);
  li.innerHTML = '';
  return li;
};

const createListItem = (text) => {
  const li = document.createElement('li');
  li.innerHTML = text;
  return li;
};

const createButton = (text, onclick) => {
  const btn = document.createElement('button');
  btn.innerHTML = text;
  btn.onclick = onclick;
  return btn;
};

const readClients = async () => {
  try {
    const data = await fetchJSON(`${URL}/clients`);

    setLabel('clientsLabel', formatTimeStamp(data.timeStamp));
    const list = getList('clientsList');

    data.providers.map((provider) => {
      const item = createListItem(
        formatClient(provider.name, formatTimeStamp(provider.timeStamp))
      );
      const subList = createList();

      fillClients(subList, provider.data.clients);
      item.appendChild(subList);
      list.appendChild(item);
      document.getElementById('clientsFilter').value = '';
      document.getElementById(
        'clientsFiltered'
      ).innerHTML = `${provider.data.clients.length} clients`;
    });
  } catch (error) {
    setLabel('error', error.message);
  }
};

const readProviders = async () => {
  const list = getList('providersList');
  try {
    const data = await fetchJSON(`${URL}/providers`);

    setLabel('providersLabel', formatTimeStamp(data.timeStamp));

    data.providers.map((provider) => {
      const item = createListItem(formatClient(provider.name, provider.status));
      item.appendChild(
        createButton(`${provider.clients} clients`, () =>
          readProviderClients(provider.name)
        )
      );
      list.appendChild(item);
    });
  } catch (error) {
    setLabel('error', error.message);
  }
};

const readProviderClients = async (provider) => {
  try {
    const data = await fetchJSON(`${URL}/providers/${provider}`);

    setLabel('clientsLabel', formatTimeStamp(data.timeStamp));
    const list = getList('clientsList');
    const clients = data.data?.clients || [];

    fillClients(list, clients);
    document.getElementById('clientsFilter').value = '';
    document.getElementById(
      'clientsFiltered'
    ).innerHTML = `${clients.length} clients`;
  } catch (error) {
    setLabel('error', error.message);
  }
};

const readClientStatus = async (name) => {
  try {
    const data = await fetchJSON(`${URL}/clients/${name}`);

    document.getElementById('clientName').value = name;
    setLabel('clientLabel', formatTimeStamp(data.timeStamp));
    const list = getList('clientList');

    data.providers.map((provider) => {
      const item = createListItem(
        formatClient(provider.name, formatTimeStamp(provider.timeStamp))
      );
      const subList = createList();
      item.appendChild(subList);
      const subEntry1 = createListItem(
        formatClient('Active Jobs', provider.data.activeJobs.length)
      );
      subList.appendChild(subEntry1);
      const subList1 = createList();
      subEntry1.appendChild(subList1);
      fillJobs(subList1, provider.data.activeJobs);

      const subEntry2 = createListItem(
        formatClient('Policies', provider.data.policies.length)
      );
      subList.appendChild(subEntry2);
      const subList2 = createList();
      subEntry2.appendChild(subList2);
      fillPolicies(subList2, provider.data.policies);
      list.appendChild(item);
    });
  } catch (error) {
    setLabel('error', error.message);
  }
};

const readClientHistory = async (name) => {
  try {
    const data = await fetchJSON(`${URL}/clients/${name}/history`);

    document.getElementById('clientName').value = name;
    setLabel('clientLabel', formatTimeStamp(data.timeStamp));
    const list = getList('clientList');

    data.providers.map((provider) => {
      const item = createListItem(
        formatClient(provider.name, formatTimeStamp(provider.timeStamp))
      );
      const subList = createList();
      item.appendChild(subList);
      const subEntry = createListItem(
        formatClient('History', provider.data.jobs.length)
      );
      subList.appendChild(subEntry);
      const subList1 = createList();
      subEntry.appendChild(subList1);
      fillJobs(subList1, provider.data.jobs);
      list.appendChild(item);
    });
  } catch (error) {
    setLabel('error', error.message);
  }
};

const readClientConfiguration = async (name) => {
  try {
    const data = await fetchJSON(`${URL}/clients/${name}/configuration`);
    console.log(data);

    document.getElementById('clientName').value = name;
    setLabel('clientLabel', formatTimeStamp(data.timeStamp));
    const list = getList('clientList');

    data.providers.map((provider) => {
      const item = createListItem(
        formatClient(provider.name, formatTimeStamp(provider.timeStamp))
      );
      const subList = createList();
      item.appendChild(subList);
      const subEntry1 = createListItem(
        formatClient('Backup types', Object.keys(provider.data).length)
      );
      subList.appendChild(subEntry1);
      const subList1 = createList();
      subEntry1.appendChild(subList1);
      fillConfiguration(subList1, provider.data);
      list.appendChild(item);
    });
  } catch (error) {
    setLabel('error', error.message);
  }
};

const getInput = () => {
  const result = document.getElementById('clientName').value;
  if (!result) alert('to search, enter a host name first');
  return result;
};
const clientStatus = () => getInput() && readClientStatus(getInput());
const clientHistory = () => getInput() && readClientHistory(getInput());
const clientConfiguration = () =>
  getInput() && readClientConfiguration(getInput());

const fillClients = (el, clients) =>
  clients.map((client) => {
    const entry = createListItem(formatClient(client.name, client.os));
    entry.appendChild(
      createButton('Status', () => readClientStatus(client.name))
    );
    entry.appendChild(
      createButton('History', () => readClientHistory(client.name))
    );
    entry.appendChild(
      createButton('Configuration', () => readClientConfiguration(client.name))
    );
    el.appendChild(entry);
  });

const fillJobs = (el, jobs) =>
  jobs.map((job) =>
    el.appendChild(
      createListItem(
        `${formatJobId(job.jobId, job.parentJob)}
        ${formatJobStatus(job.status)}
        <span>${job.jobType} ${job.subType} ${job.state}</span>
        @<span class="ts">${job.started} (${job.elapsed})</span>
        ${formatClient(job.policy, job.policyType)} 
        / ${formatClient(job.schedule, job.scheduleType)}`
      )
    )
  );

const fillConfiguration = (el, configuration) =>
  Object.keys(configuration).map((type) => {
    const data = configuration[type];
    console.log(type, data);
    el.innerHTML += `<span class="client">${type}</span>`;
    const entry = createList();
    entry.appendChild(
      createListItem(
        `includes<span class="client">${
          data.includes === '' ? 'null' : data.includes
        }</span>`
      )
    );

    if (data.daily === null) {
      entry.appendChild(
        createListItem(`<span class="status-red">No Daily</span>`)
      );
    } else {
      entry.appendChild(
        createListItem(`<span class="status-green">Daily </span>`)
      );
      const entry1 = createList();
      (Array.isArray(data.daily) ? data.daily : [data.daily]).map((daily) => {
        entry1.appendChild(
          createListItem(
            `Model:<span class="id">${daily.model} (${daily.type})</span> 
            Freq:<span class="ts">${daily.frequency}</span> 
            Window:<span class="ts">${daily.timeWindow}</span> 
            Backup retention:<span class="${
              daily.backupRetention ? 'client' : 'status-red'
            }">${daily.backupRetention}</span> 
            Copy retention:<span class="${
              daily.copyRetention ? 'detail' : 'status-yellow'
            }">${daily.copyRetention}</span> 
            Last job:${
              daily.lastJob
                ? formatJobId(daily.lastJob.jobId) +
                  formatJobStatus(daily.lastJob.status) +
                  `<span class="ts">@${daily.lastJob.started}`
                : '<span class="status-red">null</span>'
            }`
          )
        );
      });
      entry.appendChild(entry1);
    }
    el.appendChild(entry);

    if (data.monthly === null) {
      entry.appendChild(
        createListItem(`<span class="status-yellow">No Monthly</span>`)
      );
    } else {
      entry.appendChild(
        createListItem(`<span class="status-green">Monthly </span>`)
      );
      const entry1 = createList();
      (Array.isArray(data.monthly) ? data.monthly : [data.monthly]).map(
        (monthly) => {
          entry1.appendChild(
            createListItem(
              `Copy weekend:<span class="id">${monthly.copyWeekend} (${
                monthly.calendar
              })</span> 
               Freq:<span class="ts">${monthly.frequency}</span> 
               Backup retention:<span class="${
                 monthly.backupRetention ? 'client' : 'status-red'
               }">${monthly.backupRetention}</span> 
              Copy retention:<span class="${
                monthly.copyRetention ? 'detail' : 'status-yellow'
              }">${monthly.copyRetention}</span> 
                 Last job:${
                   monthly.lastJob
                     ? formatJobId(monthly.lastJob.jobId) +
                       formatJobStatus(monthly.lastJob.status) +
                       `<span class="ts">@${monthly.lastJob.started}`
                     : '<span class="status-red">null</span>'
                 }`
            )
          );
        }
      );
      entry.appendChild(entry1);
    }
    el.appendChild(entry);

    if (data.yearly === null) {
      entry.appendChild(
        createListItem(`<span class="status-yellow">No Yearly</span>`)
      );
    } else {
      entry.appendChild(
        createListItem(`<span class="status-green">Yearly </span>`)
      );
      const entry1 = createList();
      (Array.isArray(data.yearly) ? data.yearly : [data.yearly]).map(
        (yearly) => {
          entry1.appendChild(
            createListItem(
              `Copy weekend:<span class="id">${yearly.copyWeekend} (${
                yearly.calendar
              })</span> 
              Freq:<span class="ts">${yearly.frequency}</span> 
              Backup retention:<span class="${
                yearly.backupRetention ? 'client' : 'status-red'
              }">${yearly.backupRetention}</span> 
              Copy retention:<span class="${
                yearly.copyRetention ? 'detail' : 'status-yellow'
              }">${yearly.copyRetention}</span> 
                Last job:${
                  yearly.lastJob
                    ? formatJobId(yearly.lastJob.jobId) +
                      formatJobStatus(yearly.lastJob.status) +
                      `<span class="ts">@${yearly.lastJob.started}`
                    : '<span class="status-red">null</span>'
                }`
            )
          );
        }
      );
      entry.appendChild(entry1);
    }
    el.appendChild(entry);
  });

const fillPolicies = (el, policies) =>
  policies.map((policy) =>
    el.appendChild(
      createListItem(formatPolicy(policy.name, policy.policyType, policy.state))
    )
  );

const filterClients = () => {
  const filter = document.getElementById('clientsFilter').value.toUpperCase();
  const clients = document
    .getElementById('clientsList')
    .getElementsByTagName('li');
  let filtered = 0;
  for (let client of clients)
    if (client.innerText.toUpperCase().indexOf(filter) >= 1) {
      client.style.display = 'list-item';
      filtered++;
    } else {
      client.style.display = 'none';
    }
  document.getElementById('clientsFiltered').innerHTML = `${filtered} clients`;
};

document
  .getElementById('allProviders')
  .addEventListener('click', readProviders);

document.getElementById('allClients').addEventListener('click', readClients);
document.getElementById('clientStatus').addEventListener('click', clientStatus);
document
  .getElementById('clientHistory')
  .addEventListener('click', clientHistory);
document
  .getElementById('clientConfiguration')
  .addEventListener('click', clientConfiguration);

document
  .getElementById('clientsFilter')
  .addEventListener('keyup', filterClients);
