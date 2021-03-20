<script>
  let className
  export let onImageSet
  export { className as class }

  const loadExample = (event) => {
    const base64Image = getImageAsBase64(event.target)
    onImageSet(event.target, base64Image, event.target.alt)
  }

  const getImageAsBase64 = (img) => {
    // Create an empty canvas element
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    // Copy the image contents to the canvas
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    const dataURL = canvas.toDataURL('image/png')

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '')
  }
</script>

<main class={`${className || ''} print-hide examples`}>
  <p>Examples:</p>
  <div class="example-table">
    <img src="./16-Colors-Logo.png" alt="16 Colors Logo" on:click={loadExample} on:load={loadExample} />
    <img src="./examples/YoshiCart.png" alt="Yoshi Cart" on:click={loadExample} />
    <img src="./examples/Mario3.png" alt="Mario 3" on:click={loadExample} />
  </div>
</main>

<style>
  .examples {
    margin-bottom: 10px;
  }
  .example-table {
    overflow-y: scroll;
  }
</style>
