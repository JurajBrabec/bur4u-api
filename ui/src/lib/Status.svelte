<script>
  export let client;
  let rawData = false;
  const Icons = new Map([
    [false, '✅'],
    [true, '⛔'],
  ]);
</script>

<div class="table">
  <div class="caption">
    <button on:click={() => (rawData = !rawData)}>💾</button> Online/Offline
  </div>
  <div class="header">
    <div>Backups</div>
    <div>Restores</div>
  </div>
  <div class="body">
    <div class="row">
      <div>{Icons.get(client.offlineBackup)}</div>
      <div>{Icons.get(client.offlineRestore)}</div>
    </div>
  </div>
</div>

{#if rawData}
  <pre>{JSON.stringify(client, null, 2)}</pre>
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
  pre {
    font-size: 0.9em;
  }
</style>
