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
    position: absolute;
    top: 70px;
    left: 28%;
    padding: 20px;
    text-align: center;
    width: 40%;
    color: #ba3939;
    background: #ffe0e0;
    outline: 1px solid #a33a3a;
    padding: 20px;
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
    border: 1px solid #a33a3a;
  }
</style>
