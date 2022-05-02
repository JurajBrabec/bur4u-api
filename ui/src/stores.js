import { writable } from 'svelte/store';

export const error = writable('');
export const loading = writable(false);
export const label = writable('');
export const providers = writable([]);
export const clients = writable([]);
export const client = writable();

const URL = `https://${window.location.hostname}/api/v1`;
let token;

const params = (names, url) => {
  let method = 'GET';
  let body;
  if (names.includes(',')) {
    method = 'POST';
    body = JSON.stringify(names.split(','));
    url = url.replace(`/${names}`, '');
  }
  return { method, body, url };
};
export const getProviders = async () => {
  try {
    const { providers: data } = await getJSON({
      url: `${URL}/providers`,
    });
    providers.set(data);
  } catch (err) {
    loading.set(false);
    error.set(err.message);
  }
};

export const getClients = async (name) => {
  try {
    const url = name ? `${URL}/providers/${name}` : `${URL}/clients`;
    const { providers, data } = await getJSON({ url });
    if (name) {
      clients.set([{ name, clients: data.clients }]);
    } else {
      clients.set(
        providers.map(({ name, data: { clients } }) => ({ name, clients }))
      );
    }
  } catch (err) {
    loading.set(false);
    error.set(err.message);
  }
};

const getEndpoint = async (endPoint, name) => {
  let data;
  try {
    if (!name) throw new Error('Client name is required');
    const { providers } = await getJSON(
      params(name, `${URL}/clients/${name}${endPoint}`)
    );
    const result = providers.reduce(
      (result, { name: provider, data }) => [...result, { provider, ...data }],
      []
    );
    client.set({ name, result });
  } catch (err) {
    loading.set(false);
    error.set(err.message);
  }
  return data;
};

export const getStatus = async (name) => getEndpoint('', name);

export const getHistory = async (name) => getEndpoint('/history', name);

export const getConfig = async (name) => getEndpoint('/configuration', name);

export const update = async (body) => {
  let data;
  try {
    data = await getJSON({ method: 'POST', url: `${URL}/script/update`, body });
  } catch (err) {
    loading.set(false);
    error.set(err.message);
  }
  return data;
};

const getJSON = async ({ method = 'GET', url = '', body = '' } = {}) => {
  let data;
  error.set('');
  label.set('Loading...');
  loading.set(true);
  if (!token) {
    const response = await fetch(`${URL}/token?local`);
    if (response.ok) token = await response.text();
  }
  const init = {
    headers: {
      Accept: 'application/json',
      'x-auth-token': token,
    },
  };
  if (method === 'POST') {
    if (typeof body === 'string')
      init.headers['Content-Type'] = 'application/json';
    init.body = body;
    init.method = method;
  }
  const response = await fetch(url, init);
  if (!response.ok) {
    const { status, statusText } = response;
    const error = await response.text();
    throw new Error(`${status} ${statusText} - ${error}`);
  }
  data = await response.json();
  const { version, timeStamp } = data;
  const hostName = response.url.match(/^https:\/\/([^\/]+)\//)[1];
  const date = new Date(timeStamp).toISOString();
  label.set(`${hostName} PROXY response v${version} @ ${date}`);
  console.log({ url, data });
  loading.set(false);
  return data;
};
