<script>
  export let settings;
  let rawData = false;
</script>

{#if settings}
  <div class="table">
    <div class="caption">
      <button on:click={() => (rawData = !rawData)}>💾</button> Settings
    </div>
    <div class="header">
      <div>C/M</div>
      <div>Platform</div>
      <div>Prot.</div>
      <div>Product</div>
      <div>Version</div>
      <div>OS</div>
      <div>Installation path</div>
    </div>
    <div class="body">
      <div class="row">
        <div class="name">{settings.clientMaster}</div>
        <div>{settings.platform}</div>
        <div>{settings.protocolLevel}</div>
        <div>{settings.product}</div>
        <div>{settings.versionName}</div>
        <div>{settings.os}</div>
        <div><code>{settings.installationPath}</code></div>
      </div>
    </div>
  </div>
{/if}

{#if rawData}
  <pre>{JSON.stringify(settings, null, 2)}</pre>
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
  code,
  pre {
    font-size: 0.9em;
  }
</style>
