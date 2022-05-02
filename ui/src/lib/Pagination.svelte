<script>
  export let buttons = 5;
  export let limit = 10;
  export let page = 1;
  export let total;

  $: pages = Math.ceil(total / limit);
  $: page = page > pages ? pages : page < 1 ? 1 : page;
  $: pageMin = Math.max(
    1,
    Math.min(page - Math.floor(buttons / 2), pages - buttons + 1)
  );
  $: pageMax = Math.min(pageMin + buttons - 1, pages);
</script>

{#if pages > 1}
  <div>
    <button on:click={() => (page = page - 1)} disabled={page <= 1}>➖</button>
    {#each Array(pages) as _, button}
      {#if button + 1 >= pageMin && button + 1 <= pageMax}
        <button
          class:current={page === button + 1}
          on:click={() => (page = button + 1)}
        >
          {button + 1}
        </button>
      {/if}
    {/each}
    <button on:click={() => (page = page + 1)} disabled={page >= pages}
      >➕</button
    >
  </div>
{/if}

<style>
  div {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    margin: 10px 0px;
  }
  button {
    margin: 1px;
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 3px;
    background-color: #eee;
    cursor: pointer;
    font-size: 0.9em;
  }
  .current {
    background-color: white;
    font-weight: bold;
  }
</style>
