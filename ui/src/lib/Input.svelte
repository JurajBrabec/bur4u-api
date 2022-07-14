<script>
  export let id;
  export let label;
  export let type = 'text';
  export let checked = false;
  export let defaultChecked = false;
  export let value = '';
  export let defaultValue = '';
  export let list = [];
  export let defaultList = [];

  let defaultId = `${id}-default`;
  $: isDefault =
    type === 'checkbox'
      ? checked === defaultChecked
      : type === 'list'
      ? JSON.stringify(list) === JSON.stringify(defaultList)
      : value === defaultValue;

  const setDefault = () => {
    checked = defaultChecked;
    value = defaultValue;
    list = [...defaultList];
  };
  const removeItem = (index) => {
    list = list.filter((_, i) => i !== index);
  };
  const addItem = () => {
    list = [...list, { addr: 'test', api_token: '' }];
  };
</script>

<div>
  {#if type === 'checkbox'}
    <input {id} type="checkbox" title={label} bind:checked />
  {/if}
  <label for={id}>{label}</label>
  {#if type === 'number'}
    <input {id} type="number" title={label} bind:value />
  {/if}
  {#if type === 'text'}
    <input {id} type="text" title={label} bind:value />
  {/if}
  <input
    id={defaultId}
    type="checkbox"
    bind:checked={isDefault}
    on:change={setDefault}
    disabled={isDefault}
    title="Use default value"
  />
  {#if type === 'list'}
    <ul {id} title={label}>
      {#each list as { addr }, i}
        <li>
          {addr} <button on:click={() => removeItem(i)}>Remove</button>
        </li>
      {/each}
    </ul>
    <button on:click={addItem}>Add</button>
  {/if}
</div>

<style>
  div {
    margin-top: 15px;
  }
  label {
    font-weight: bold;
  }
  input {
    padding: 5px;
  }
</style>
