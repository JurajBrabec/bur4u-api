<script>
  import { onMount } from 'svelte';
  import { getToken } from '../stores.js';
  let inputName;
  let inputPassword;
  let name = localStorage.userName;
  let password;
  let loading;
  let error = '';

  const login = async () => {
    error = '';
    loading = true;
    const result = await getToken({ name, password });
    if (result.error) {
      error = result.error;
    } else {
      localStorage.userName = name;
    }
    loading = false;
  };
  onMount(() => (name ? inputPassword.focus() : inputName.focus()));
</script>

<div id="background" />
<div id="modal">
  <form on:submit|preventDefault={login}>
    <h3>Token Service Authentication</h3>
    <input
      disabled={loading}
      bind:this={inputName}
      bind:value={name}
      placeholder="User name"
    />
    <input
      disabled={loading}
      bind:this={inputPassword}
      bind:value={password}
      type="password"
      placeholder="Password"
    />
    <button type="submit" disabled={loading}
      >{loading ? '⏲️ Logging in...' : '🔐 Log in'}</button
    >
  </form>
  <div class="error">{error}</div>
</div>

<style>
  #background {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0, 0, 0);
    opacity: 0.5;
  }

  #modal {
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: #fff;
    filter: drop-shadow(0 0 20px #333);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin: 5px;
  }
  button {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin: 5px;
  }
  .error {
    color: red;
    text-align: center;
  }
</style>
