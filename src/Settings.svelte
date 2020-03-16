<script>
  let className
  export let uniqueColors
  export let error
  export let onImageSet
  export { className as class }

  const onPrint = () => window.print()

  const onSetImage = event => {
    const file = event.target.files[0]

    if (!file || !file.type.startsWith('image/')) {
      error = 'Invalid File Format'
      return
    }

    const img = document.createElement('img')
    img.classList.add('obj')
    img.file = file

    const preview = document.querySelector('#preview')
    preview.querySelectorAll('*').forEach(n => n.remove())
    preview.appendChild(img)

    onImageSet(img, file)
  }
</script>

<style>
  main {
    margin: auto;
    max-width: 400px;
    text-align: left;
  }

  .preview {
    position: absolute;
    opacity: 0;
  }

  input {
    margin-bottom: 1rem;
  }
</style>

<main class={className}>
  <div class="preview" id="preview" />
  <div style="display: flex; flex-direction: row; justify-content: space-between">
    <label for="image">Upload Image:</label>
    {#if uniqueColors.length}
      <span role="img" aria-label="print" alt="print" on:click={onPrint}>🖨</span>
    {/if}
  </div>
  <input class="nes-input" type="file" id="image" name="image" accept="image/png, image/gif" on:change={onSetImage} />
  {#if error}
    <p class="error">{error}</p>
  {/if}
</main>
