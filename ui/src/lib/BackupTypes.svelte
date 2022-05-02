<script>
  export let backupTypes;
  let rawData = false;
</script>

{#if backupTypes}
  <h3>
    <button on:click={() => (rawData = !rawData)}>🗃</button>
    Backup Types
  </h3>
  {#each backupTypes as backupType}
    <div class="table">
      <div class="caption">
        {backupType.name}<code>({backupType.includes})</code>
      </div>
      <div class="header">
        <div>Retention type</div>
        <div>Model</div>
        <div>Type</div>
        <div>Frequency</div>
        <div>Start time</div>
        <div>Time window</div>
        <div>Retention</div>
        <div>Copy</div>
        <div>Last job</div>
      </div>
      <div class="body">
        {#each backupType.daily || [] as bt}
          <div class="row" class:disabled={bt.state === 'Disabled'}>
            <div class="name">
              {#if bt.state === 'Disabled'}<i>🚫 </i>{/if}

              Daily
            </div>
            <div>{bt.model}</div>
            <div>{bt.type}</div>
            <div>{bt.frequency}</div>
            <div>{bt.startTime || ''}</div>
            <div>{bt.timeWindow}</div>
            <div>{bt.backupRetention || ''}</div>
            <div>{bt.copyRetention || ''}</div>
            <div class:error={!bt.lastJob || bt.lastjob.status > 0}>
              {bt.lastJob?.started || 'N/A'}
            </div>
          </div>
        {:else}
          <div class="row name error">
            <div>Daily</div>
            <div>Not found</div>
          </div>
        {/each}
        {#each backupType.monthly || [] as bt}
          <div class="row" class:disabled={bt.state === 'Disabled'}>
            <div class="name">
              {#if bt.state === 'Disabled'}<i>🚫 </i>{/if}
              Monthly
            </div>
            <div />
            <div>Full</div>
            <div>{bt.frequency}</div>
            <div>{bt.copyWeekend || ''}</div>
            <div>{bt.calendar}</div>
            <div>{bt.backupRetention || ''}</div>
            <div>{bt.copyRetention || ''}</div>
            <div class:error={!bt.lastJob || bt.lastjob.status > 0}>
              {bt.lastJob?.started || 'N/A'}
            </div>
          </div>
        {:else}
          <div class="row name warning">
            <div>Monthly</div>
            <div>Not found</div>
          </div>
        {/each}
        {#each backupType.yearly || [] as bt}
          <div class="row" class:disabled={bt.state === 'Disabled'}>
            <div class="name">
              {#if bt.state === 'Disabled'}<i>🚫 </i>{/if}

              Yearly
            </div>
            <div />
            <div>Full</div>
            <div>{bt.frequency}</div>
            <div>{bt.startTime || ''}</div>
            <div>{bt.calendar}</div>
            <div>{bt.backupRetention || ''}</div>
            <div>{bt.copyRetention || ''}</div>
            <div class:error={!bt.lastJob || bt.lastjob.status > 0}>
              {bt.lastJob?.started || 'N/A'}
            </div>
          </div>
        {:else}
          <div class="row name">
            <div>Yearly</div>
            <div>Not found</div>
          </div>
        {/each}
      </div>
    </div>
  {/each}

  {#if rawData}
    <pre>{JSON.stringify(backupTypes, null, 2)}</pre>
  {/if}
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
  .warning {
    color: orange;
  }
  .error {
    color: red;
  }
  code {
    font-size: 0.7em;
    font-weight: normal;
    margin: 0px 8px;
  }
  pre {
    font-size: 0.9em;
  }
</style>
