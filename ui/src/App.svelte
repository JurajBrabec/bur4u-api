<script>
  import Error from './lib/Error.svelte';
  import Loading from './lib/Loading.svelte';
  import Providers from './lib/Providers.svelte';
  import Clients from './lib/Clients.svelte';
  import Client from './lib/Client.svelte';
  import Update from './lib/Update.svelte';

  import { error, loading, label, getProviders, getClients } from './stores.js';
</script>

<main>
  <Error bind:error={$error} />
  <Loading bind:loading={$loading}>Loading...</Loading>
  <header>
    <h2>BUR-4U-API User Interface</h2>
    <code>{$label}</code>
    <Update />
  </header>
  <nav>
    <h3>
      <button on:click={() => getProviders()} title="Query providers"
        ><i>🖥</i></button
      >
      <button on:click={() => getClients()} title="Query all clients"
        ><i>💻</i></button
      >
    </h3>
    <Providers />
    <Clients />
  </nav>
  <article><Client /></article>
  <footer>
    <strong>&copy; 2022</strong> DXC.technology /
    <em>Juraj Brabec</em>
  </footer>
</main>

<style>
  :root {
    font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;
    font-size: 13px;
    background-color: rgb(207, 207, 207);
  }

  main {
    display: grid;
    grid-template-areas:
      'header header'
      'nav article'
      'footer footer';
    grid-template-rows: 85px 1fr;
    grid-template-columns: min(512px, 37%) 1fr;
    grid-row-gap: 4px;
    grid-column-gap: 4px;
    height: 98vh;
    margin: 0px;
  }
  header,
  footer,
  article,
  nav {
    background-color: white;
    padding: 5px;
  }
  header {
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  footer {
    grid-area: footer;
    font-size: 1.2em;
    color: rgb(90, 90, 90);
    padding: 15px;
  }
  article {
    grid-area: article;
  }
  nav {
    grid-area: nav;
  }
  h2 {
    margin: 10px;
  }
  h3 {
    margin: 8px 0px;
  }
  button {
    padding: 5px;
  }
  code {
    font-size: 0.9em;
    color: gray;
  }
</style>
