<script>
  import palettes, { getById } from './palletes'

  let className
  let files = []
  export let selectedPalette
  export let uniqueColors
  export let error
  export let onSetImage
  export let onSelectPalette
  export { className as class }

  const onPrint = () => window.print()

  const setImage = () => {
    if (files.length) {
      onSetImage(files[0])
    }
  }

  const selectPalette = () => {
    onSelectPalette(selectedPalette)
    setImage()
  }
</script>

<main class={className}>
  <img class="preview" id="preview" />
  <div style="display: flex; flex-direction: row; justify-content: space-between">
    <label for="image">Upload Image:</label>
    {#if uniqueColors.length}
      <span role="img" aria-label="print" on:click={onPrint}>🖨</span>
    {/if}
  </div>
  <input
    class="nes-input"
    type="file"
    id="image"
    name="image"
    accept="image/png, image/gif"
    bind:files
    on:change={setImage}
  />
  <label for="palette">Palette:</label>
  <div class="palette-block">
    <select
      class="nes-input"
      id="palette"
      name="palette"
      bind:value={selectedPalette}
      on:change={selectPalette}
      on:blur={selectPalette}
    >
      {#each palettes as palette}
        <option value={palette.id}>{palette.name}</option>
      {/each}
    </select>
    {#if selectedPalette && getById(selectedPalette).buy}
      <a href={getById(selectedPalette)?.buy} target="_blank" class="nes-btn buy-btn">Buy</a>
    {/if}
  </div>
  {#if error}
    <p class="error">{error}</p>
  {/if}
</main>

<style>
  main {
    margin: auto;
    max-width: 450px;
    text-align: left;
  }

  #preview {
    position: absolute;
    opacity: 0;
  }

  .palette-block {
    display: flex;
    flex-direction: row;
  }

  .buy-btn {
    margin-left: 0.7rem;
  }

  input,
  .palette-block {
    margin-bottom: 1rem;
  }

  select {
    height: 44px;
  }
</style>
