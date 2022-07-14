<script>
  import { getConfiguration, setConfiguration } from '../stores.js';
  import { onMount } from 'svelte';
  import Input from './Input.svelte';

  let moduleName, currentConfig, defaultConfig;
  let data;

  const storeConfig = async () => {
    let config = { moduleName };
    const setConfig = (name) => {
      if (data[name] !== defaultConfig[name]) config[name] = data[name];
    };
    if (moduleName === 'proxy') {
      setConfig('logPath');
      setConfig('logRotation');
      setConfig('port');
      setConfig('queryCron');
      setConfig('ui');
      setConfig('providers');
    }
    console.log(config);
    setConfiguration(config);
  };

  onMount(async () => {
    ({ moduleName, currentConfig, defaultConfig } = await getConfiguration());
    data = { ...defaultConfig, ...currentConfig };
  });
</script>

{#if moduleName === 'proxy'}
  <Input
    id="logPath"
    label="Log Path"
    bind:value={data.logPath}
    defaultValue={defaultConfig.logPath}
  />
  <Input
    id="logRotation"
    label="Log rotation"
    bind:value={data.logRotation}
    defaultValue={defaultConfig.logRotation}
  />
  <Input
    id="port"
    label="Port"
    type="number"
    bind:value={data.port}
    defaultValue={defaultConfig.port}
  />
  <Input
    id="queryCron"
    label="Query Cron"
    bind:value={data.queryCron}
    defaultValue={defaultConfig.queryCron}
  />
  <Input
    id="ui"
    label="User Interface"
    type="checkbox"
    bind:checked={data.ui}
    defaultChecked={defaultConfig.ui}
  />
  <Input
    id="providers"
    label="Providers"
    type="list"
    bind:list={data.providers}
    defaultList={defaultConfig.providers}
  />
{/if}

<button on:click={storeConfig} disabled={!moduleName}>Store & Restart</button>

<style>
  button {
    padding: 5px;
  }
</style>
