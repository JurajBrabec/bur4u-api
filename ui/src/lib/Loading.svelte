<script>
  export let loading;
</script>

{#if loading}
  <div><span class="spinner" /><span><slot /></span></div>
{/if}

<style>
  div {
    position: absolute;
    display: flex;
    align-items: center;
    top: 100px;
    left: 30%;
    padding: 20px;
    width: 35%;
    color: #39ba4a;
    background: #ecffe0;
    outline: 1px solid #3ea33a;
    padding: 20px;
  }
  span {
    margin: 0px 5px;
  }
  .spinner {
    animation: spin 1s infinite linear;
    border: 2px solid #3ea33a;
    border-left: 4px solid #ecffe0;
    border-radius: 50%;
    height: 15px;
    width: 13px;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
