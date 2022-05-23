<script>
  export let loading;
</script>

{#if loading}
  <div><i>♻</i><span><slot /></span></div>
{/if}

<style>
  div {
    position: absolute;
    display: flex;
    align-items: center;
    top: 140px;
    left: 35%;
    padding: 20px;
    width: 40%;
    color: #39ba4a;
    background: #ecffe0;
    outline: 1px solid #3ea33a;
    padding: 20px;
  }
  i {
    display: inline-block;
    width: 28px;
    font-style: normal;
    font-weight: bold;
    font-size: 2rem;
  }
  span {
    margin: 0px 5px;
  }
</style>
