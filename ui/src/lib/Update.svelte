<script>
  import { update } from '../stores.js';

  let input;
  let files;

  const submit = async () => {
    const body = new FormData();
    body.append('file', files[0]);
    const { data } = await update(body);
    alert(data);
  };
</script>

<form on:submit|preventDefault={submit}>
  <button type="button" title="Select file" on:click={() => input.click()}
    >📂</button
  >
  <input
    bind:this={input}
    bind:files
    accept=".zip"
    id="file"
    name="file"
    type="file"
  />
  <button
    disabled={!files?.length}
    title="Update {files ? files[0].name : ''}"
    type="submit">♻️</button
  >
</form>

<style>
  #file {
    display: none !important;
  }
  button {
    padding: 5px;
  }
</style>
