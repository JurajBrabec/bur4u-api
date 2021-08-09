const URL = '/api/v1';
const TOKEN = '2242189293e5412ba71a8f2086a3ef0c';

const fetchJSON = async (url) => {
  setLabel('error', '');
  const response = await fetch(url, { headers: { 'x-auth-token': TOKEN } });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${error}`);
  }
  return response.json();
};

const formatTimeStamp = (timeStamp) =>
  `@<span class="ts">${new Date(timeStamp)}</span>`;

const formatClient = (name, detail) =>
  `<span class="client">${name} (<span class="detail">${detail}</span>)</span>`;

const formatJobId = (jobId, parentJob) =>
  parentJob !== jobId ? `${parentJob}-${jobId}` : `${jobId}`;

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

const getInput = () => {
  const result = document.getElementById('clientName').value;
  if (!result) alert('to search, enter a host name first');
  return result;
};
const clientStatus = () => getInput() && readClientStatus(getInput());
const clientHistory = () => getInput() && readClientHistory(getInput());

const fillClients = (el, clients) =>
  clients.map((client) => {
    const entry = createListItem(formatClient(client.name, client.os));
    entry.appendChild(
      createButton('Status', () => readClientStatus(client.name))
    );
    entry.appendChild(
      createButton('History', () => readClientHistory(client.name))
    );
    el.appendChild(entry);
  });

const fillJobs = (el, jobs) =>
  jobs.map((job) =>
    el.appendChild(
      createListItem(
        `<span class="id">${formatJobId(job.jobId, job.parentJob)}</span>
        <span class="status">${job.status}</span>
        <span>${job.jobType} ${job.subType} ${job.state}</span>
        @<span class="ts">${job.started} (${job.elapsed})</span>
        ${formatClient(job.policy, job.policyType)} 
        / ${formatClient(job.schedule, job.scheduleType)}`
      )
    )
  );

const fillPolicies = (el, policies) =>
  policies.map((policy) =>
    el.appendChild(createListItem(formatClient(policy.name, policy.policyType)))
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
  .getElementById('clientsFilter')
  .addEventListener('keyup', filterClients);
