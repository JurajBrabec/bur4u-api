<script>
  export let error;
  const clear = () => (error = '');
</script>

{#if error}
  <div>
    <i>⚠️</i><span> {error}</span>
    <button on:click={clear}>x</button>
  </div>
{/if}

<style>
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 20px;
    left: 28%;
    padding: 15px 20px;
    text-align: center;
    width: 40%;
    color: #ba3939;
    background: #ffe0e0;
    outline: 3px solid #a33a3a;
  }
  i {
    display: inline-block;
    width: 28px;
    font-style: normal;
    font-size: 1.5rem;
  }
  span {
    margin: 0px 5px;
  }
  button {
    background: #ba3939;
    color: #ffe0e0;
    border: 2px solid #a33a3a;
  }
</style>
