<script>
  export let policies;
  let rawData = false;
</script>

{#if policies}
  <div class="table">
    <div class="caption">
      <button on:click={() => (rawData = !rawData)}>🗂</button>
      Policies
    </div>
    <div class="header">
      <div>Name</div>
      <div>Type</div>
      <div>Subtype</div>
      <div>Clients</div>
      <div>Schedules</div>
    </div>
    <div class="body">
      {#each policies as policy}
        <div class="row" class:disabled={policy.state === 'Disabled'}>
          <div class="name">
            {#if policy.state === 'Disabled'}🚫 {/if}
            {policy.name}
          </div>
          <div>{policy.policyType}</div>
          <div>{policy.jobSubtype}</div>
          <div>{policy.clients.length}</div>
          <div>{policy.schedules.map((s) => s.name).join(',')}</div>
        </div>
      {:else}
        <div class="row">
          <div class="name failure">No policies found</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if rawData}
  <pre>{JSON.stringify(policies, null, 2)}</pre>
{/if}

<style>
  .table {
    display: table;
  }
  .caption {
    display: table-caption;
    font-weight: bold;
    font-size: 1.2em;
    padding: 10px 0px;
  }
  .header {
    display: table-header-group;
    font-weight: bold;
  }
  .header > div {
    display: table-cell;
    padding: 10px;
    text-align: justify;
    border-bottom: 1px solid silver;
  }
  .body {
    display: table-row-group;
  }
  .row {
    display: table-row;
  }
  .row > div {
    display: table-cell;
    padding: 3px 10px;
    font-size: 0.9em;
  }
  .name {
    font-weight: bold;
  }
  .disabled {
    color: silver;
    font-style: italic;
  }
  pre {
    font-size: 0.9em;
  }
</style>
