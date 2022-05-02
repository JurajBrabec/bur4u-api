<script>
  export let jobs = null;
  export let history = false;
  let rawData = false;
</script>

{#if jobs}
  <div class="table">
    <div class="caption">
      <button on:click={() => (rawData = !rawData)}>
        {history ? '📊' : '📜'}
      </button>
      {history ? 'History' : 'Active Jobs'}
    </div>
    <div class="header">
      <div>Job ID</div>
      <div>Parent</div>
      <div>Status</div>
      <div>Type</div>
      <div>Started</div>
      <div>Elapsed</div>
      <div>Policy</div>
      <div>Type</div>
      <div>Schedule</div>
      <div>Type</div>
    </div>
    <div class="body">
      {#each jobs as job}
        <div class="row" class:failure={job.status > 0}>
          <div class="name">{job.jobId}</div>
          <div>{job.parentJob}</div>
          <div>{job.status}</div>
          <div>{job.jobType}/{job.subType}</div>
          <div>{job.started}</div>
          <div>{job.elapsed}</div>
          <div>{job.policy}</div>
          <div>{job.policyType}</div>
          <div>{job.schedule}</div>
          <div>{job.scheduleType}</div>
        </div>
      {:else}
        <div class="row">
          <div class="name failure">No jobs found</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if rawData}
  <pre>{JSON.stringify(jobs, null, 2)}</pre>
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
  .failure {
    color: darkred;
  }
  pre {
    font-size: 0.9em;
  }
</style>
