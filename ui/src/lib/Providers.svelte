<script>
  import { providers, getClients } from '../stores.js';
</script>

{#if $providers.length}
  <div>
    <h3>
      <i>🖥</i>{` Providers (${$providers.length})`}
    </h3>
    <ul>
      {#each $providers as provider}
        <li>
          <i>{provider.status === 'OK' ? '🖥' : '❌'}</i>
          <span
            class="name"
            title="Click to query clients"
            on:click={() => getClients(provider.name)}>{provider.name}</span
          >
          {#if provider.status === 'OK'}
            <span class="clients">{provider.clients} clients</span>
            (<span class="version">v{provider.version}</span>)
          {:else}
            <span class="status">{provider.status}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  h3 {
    margin: 8px 0px;
  }
  ul {
    list-style-type: none;
    padding: 0px 16px;
  }
  li {
    margin: 5px 0px;
  }

  .name {
    cursor: pointer;
    text-decoration: underline;
  }
  .name:hover {
    background-color: #f0f0f0;
  }
  .version {
    font-size: 0.8em;
    font-style: italic;
  }
</style>
