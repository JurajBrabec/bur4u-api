<script>
  import Pagination from './Pagination.svelte';
  import { clients, getStatus } from '../stores.js';

  let filter = '';
  let page = 1;
  let limit = 20;

  let total;
  let list;

  $: {
    list = $clients.map((provider) => {
      const clients = provider.clients.filter((client) =>
        client.name.toLowerCase().includes(filter.toLowerCase())
      );
      return { name: provider.name, clients };
    });
    total = list.reduce(
      (total, provider) => total + provider.clients.length,
      0
    );
  }
</script>

{#if $clients.length}
  <div>
    <h3>
      💻{` Clients (${total})`}
    </h3>
    <input
      type="text"
      bind:value={filter}
      placeholder="Filter clients for..."
    />
    <Pagination bind:page {limit} {total} />
    <ol>
      {#each list as provider (provider.name)}
        <li>
          <h4>
            🖥{` ${provider.name} (${provider.clients.length} clients)`}
          </h4>
          <ul>
            {#each provider.clients as client, index (client.name)}
              {#if index >= (page - 1) * limit && index < page * limit}
                <li>
                  {client.settings.product ? '💻' : '❌'}
                  <span
                    class="name"
                    on:click={() => getStatus(client.name)}
                    title="Click to query client">{client.name}</span
                  >
                  (<span class="architecture"
                    >{client.architecture}/{client.os}</span
                  >)
                </li>
              {/if}
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
  </div>
{/if}

<style>
  h3 {
    margin: 8px 0px;
  }
  input {
    padding: 5px;
    width: 95%;
    max-width: 300px;
  }
  ol {
    list-style-type: none;
    padding: 0px;
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
  .architecture {
    font-size: 0.8em;
    font-style: italic;
  }
</style>
