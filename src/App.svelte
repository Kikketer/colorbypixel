<script>
  import Footer from './Footer.svelte'
  import Settings from './Settings.svelte'
  import Examples from './Examples.svelte'
  import { getImageAsColorNames } from './utils'
  import { fade } from 'svelte/transition'

  let uniqueColors = []
  let error = ''
  let loading = false
  let selectedPalette = 'classic'
  let currentImage
  let currentFile

  const onSelectPalette = (palette) => {
    selectedPalette = palette
    if (currentImage) {
      // Reload the image
      onImageSet(currentImage, currentFile)
    }
  }

  const onSetImage = async (imageFile) => {
    try {
      imageFile = imageFile || currentFile

      currentImage = await validateImage(imageFile)
      currentFile = imageFile
      await onImageSet(currentImage, currentFile, selectedPalette)
    } catch (err) {
      error = err?.message
    }
  }

  const validateImage = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject('Invalid File Format')
      }

      const img = document.querySelector('#preview')

      // Read the file to place it on the page
      const reader = new FileReader()
      reader.onload = ({ target }) => {
        img.onload = () => {
          if (img.offsetWidth <= 0) {
            return
          }

          if (img.offsetWidth > 32 || img.offsetHeight > 90) {
            return reject('Image is too large, try 32x32')
          }

          return resolve(img)
        }

        img.src = target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const onImageSet = async (img, file) => {
    loading = true

    currentImage = img || currentImage
    currentFile = file || currentFile

    const doIt = async (buffer) => {
      const result = await getImageAsColorNames(
        buffer,
        currentImage.offsetWidth,
        currentImage.offsetHeight,
        selectedPalette
      )
      uniqueColors = result.unionedColors
      drawArt(result.imageAsColorNames)
      drawColorSheet(result.imageAsColorNames)
      loading = false
    }

    // Converts a base64 string of a file into an array buffer
    if (typeof currentFile === 'string') {
      const binary_string = window.atob(currentFile)
      const len = binary_string.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
      }

      await doIt(bytes.buffer)
    } else {
      const reader = new FileReader()
      reader.onload = async (event) => {
        doIt(event.target.result)
      }
      reader.readAsArrayBuffer(currentFile)
    }
  }

  const drawArt = (imageAsColorNames) => {
    const squareSize = 18 // 75px at 300dpi = 1/4", 18 @ 72dpi
    let canvas = document.querySelector('#art')
    let context = canvas.getContext('2d')
    canvas.width = imageAsColorNames[0].length * squareSize
    canvas.height = imageAsColorNames.length * squareSize

    // TODO
    // setDPI(canvas, 300)

    for (let row = 0; row < imageAsColorNames.length; row++) {
      for (let col = 0; col < imageAsColorNames[0].length; col++) {
        context.fillStyle = imageAsColorNames[row][col].hex
        context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize)

        context.font = '8px "Press Start 2P", sans-serif'
        context.fillStyle = '#ffffff' //ntc.LightenDarkenColor('#dedede', -10)
        const label = uniqueColors
          .map((c) => c.name.toLowerCase())
          .indexOf(imageAsColorNames[row][col].name.toLowerCase())
        const textSize = context.measureText(label)
        context.fillText(
          label,
          col * squareSize + squareSize / 2 - textSize.width / 2,
          row * squareSize + squareSize / 2 + textSize.actualBoundingBoxAscent / 2
        )
      }
    }
  }

  const drawColorSheet = (imageAsColorNames) => {
    const squareSize = 24 // 75px at 300dpi = 1/4", 18 @ 72dpi, 24 @ 96dpi (canvas)
    let canvas = document.querySelector('#color-sheet')
    let context = canvas.getContext('2d')
    canvas.width = imageAsColorNames[0].length * squareSize
    canvas.height = imageAsColorNames.length * squareSize

    // TODO
    // setDPI(canvas, 300)

    for (let row = 0; row < imageAsColorNames.length; row++) {
      for (let col = 0; col < imageAsColorNames[0].length; col++) {
        context.fillStyle = '#ffffff'
        context.strokeStyle = '#dedede'
        context.strokeRect(col * squareSize, row * squareSize, squareSize, squareSize)
        context.font = '8px "Press Start 2P", sans-serif'
        context.fillStyle = '#dedede'
        if (imageAsColorNames[row][col].name.toLowerCase() !== 'white') {
          const label = uniqueColors
            .map((c) => c.name.toLowerCase())
            .indexOf(imageAsColorNames[row][col].name.toLowerCase())
          const textSize = context.measureText(label)
          context.fillText(
            label,
            col * squareSize + squareSize / 2 - textSize.width / 2,
            row * squareSize + squareSize / 2 + textSize.actualBoundingBoxAscent / 2
          )
        }
      }
    }
  }

  // function setDPI(canvas, dpi) {
  //   // Set up CSS size.
  //   canvas.style.width = canvas.style.width || canvas.width + 'px'
  //   canvas.style.height = canvas.style.height || canvas.height + 'px'
  //
  //   // Resize canvas and scale future draws.
  //   var scaleFactor = dpi / 96
  //   canvas.width = Math.ceil(canvas.width * scaleFactor)
  //   canvas.height = Math.ceil(canvas.height * scaleFactor)
  //   var ctx = canvas.getContext('2d')
  //   ctx.scale(scaleFactor, scaleFactor)
  // }
</script>

<main>
  <h1 class="print-hide">16 Colors</h1>
  <Settings class="print-hide" {uniqueColors} {error} {onSetImage} {onSelectPalette} />
  <div class="render-block">
    {#if loading}<p class="loading" transition:fade={{ duration: 200 }}>loading...</p>{/if}
    <canvas id="art" class="print-hide" />
    <br />
    <canvas id="color-sheet" />
  </div>
  <table>
    <tbody>
      {#each uniqueColors as uniqueColor, index}
        <tr>
          <td>
            {index}:
            <span class="color-block" style={`background: ${uniqueColor.hex}`} />
            {uniqueColor.name}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <Examples {onImageSet} />

  <div class="spacer" />
  <Footer />
</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  h1 {
    text-transform: uppercase;
    font-size: 2rem;
  }

  canvas {
    border: 1px solid grey;
    margin: auto;
    max-width: 100%;
  }

  table {
    margin: 0.4rem auto;
    min-width: 200px;
    text-align: left;
  }

  .render-block {
    position: relative;
  }

  .spacer {
    flex: 1;
  }

  .color-block {
    width: 1rem;
    height: 1rem;
    border: 1px solid #d3d3d3;
    display: inline-block;
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .loading {
    position: absolute;
    top: 1rem;
    text-align: center;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    padding: 1rem 0;
  }

  @media print {
    #color-sheet {
      display: block;
    }
  }

  @media screen {
    #color-sheet {
      display: none;
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
