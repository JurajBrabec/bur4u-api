<script>
  import { onDestroy } from 'svelte';
  import { client, getStatus, getHistory, getConfig } from '../stores.js';
  import Settings from './Settings.svelte';
  import Jobs from './Jobs.svelte';
  import Policies from './Policies.svelte';
  import BackupTypes from './BackupTypes.svelte';

  let name;

  const unsubscribe = client.subscribe((client = {}) => {
    name = client.name;
  });
  onDestroy(async () => {
    unsubscribe();
  });
</script>

<div>
  <h3>
    💻
    <input type="text" bind:value={name} placeholder="Client name" />
    <button on:click={() => getStatus(name)} title="Query status">💡</button>
    <button on:click={() => getHistory(name)} title="Query history">📊</button>
    <button on:click={() => getConfig(name)} title="Query configuration"
      >⚙</button
    >
  </h3>
  {#if $client}
    <ul>
      {#each $client.result as result}
        <li>
          <code>
            {result.provider} API response {`v${result.version} @ ${new Date(
              result.timeStamp
            ).toISOString()}`}
          </code>
          <Settings settings={result.settings} />
          <Policies policies={result.policies} />
          <Jobs jobs={result.activeJobs} />
          <Jobs jobs={result.jobs} history={true} />
          <BackupTypes backupTypes={result.backupTypes} />
        </li>
      {:else}
        <li>Nothing found</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  h3 {
    margin: 8px 0px;
  }
  button {
    padding: 5px;
  }
  input {
    width: 300px;
    padding: 5px;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin: 5px 0px;
  }
  code {
    font-size: 0.9em;
    color: gray;
  }
</style>
