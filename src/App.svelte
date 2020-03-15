<script>
  import Jimp from 'jimp/browser/lib/jimp'
  import _ from 'lodash'
  import ntc from './ntc'
  import Footer from './Footer.svelte'

  let uniqueColors = []
  let error = ''

  const componentToHex = c => {
    var hex = c.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const rgbToHex = (r, g, b) => {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  }

  const setImage = async event => {
    const file = event.target.files[0]

    if (!file.type.startsWith('image/')) {
      return
    }

    const img = document.createElement('img') //document.querySelector('#preview')
    img.classList.add('obj')
    img.file = file

    const preview = document.querySelector('#preview')
    preview.querySelectorAll('*').forEach(n => n.remove())
    preview.appendChild(img)

    const reader = new FileReader()
    // reader.onload = iImg => event => (iImg.src = event.target.result)(img)
    reader.onload = event => {
      img.src = event.target.result
      try {
        onPreviewLoaded(img)

        const otherReader = new FileReader()
        otherReader.onload = async event => {
          console.log('reading ', img)
          getImageAsColorNames(event.target.result, img.offsetWidth, img.offsetHeight)
        }
        otherReader.readAsArrayBuffer(file)
      } catch (err) {
        console.error(err)
        error = 'Something went wrong'
      }
    }
    reader.readAsDataURL(file)
  }

  const onPreviewLoaded = async previewImage => {
    // Check the size and throw an error if needed
    if (previewImage.offsetWidth > 32 || previewImage.offsetHeight > 36) {
      throw new Error(`Image is too big: ${previewImage.offsetWidth}x${previewImage.offsetHeight}`)
    }
  }

  const readAndReturnColorName = (jimpImage, x, y) => {
    const colorHex = jimpImage.getPixelColor(x, y)

    const rgba = Jimp.intToRGBA(colorHex)
    if (rgba.a < 255) {
      return ntc.names.find(nameObj => nameObj[1] === 'White')
    }

    const cssHex = rgbToHex(rgba.r, rgba.g, rgba.b)
    return ntc.name(cssHex)
  }

  const getImageAsColorNames = async (buffer, width, height) => {
    // const preview = document.querySelector('#preview')
    const jimpImage = await Jimp.read(buffer)

    const imageAsColorNames = []

    for (let row = 0; row < height; row++) {
      if (!imageAsColorNames[row]) {
        imageAsColorNames[row] = []
      }

      for (let column = 0; column < width; column++) {
        imageAsColorNames[row].push(readAndReturnColorName(jimpImage, column, row))
      }
    }

    console.log('width: ', imageAsColorNames[0].length)

    uniqueColors = _.union(_.flatten(imageAsColorNames).map(ob => ob.name))

    drawArt(imageAsColorNames)
    drawColorSheet(imageAsColorNames)
  }

  const drawArt = imageAsColorNames => {
    const squareSize = 18 // 75px at 300dpi = 1/4", 18 @ 72dpi
    let canvas = document.querySelector('#art')
    let context = canvas.getContext('2d')
    canvas.width = imageAsColorNames[0].length * squareSize
    canvas.height = imageAsColorNames.length * squareSize

    // TODO
    // setDPI(canvas, 300)

    for (let row = 0; row < imageAsColorNames.length; row++) {
      for (let col = 0; col < imageAsColorNames[0].length; col++) {
        // console.log('Drawing row: ', imageAsColorNames[row][col])
        context.fillStyle = imageAsColorNames[row][col].hex
        context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize)

        context.font = '8px "Press Start 2P", sans-serif'
        context.fillStyle = '#ffffff' //ntc.LightenDarkenColor('#dedede', -10)
        const label = uniqueColors.map(c => c.toLowerCase()).indexOf(imageAsColorNames[row][col].name.toLowerCase())
        const textSize = context.measureText(label)
        context.fillText(
          label,
          col * squareSize + squareSize / 2 - textSize.width / 2,
          row * squareSize + squareSize / 2 + textSize.actualBoundingBoxAscent / 2
        )
      }
    }
  }

  const drawColorSheet = imageAsColorNames => {
    const squareSize = 18 // 75px at 300dpi = 1/4", 18 @ 72dpi
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
        const label = uniqueColors.map(c => c.toLowerCase()).indexOf(imageAsColorNames[row][col].name.toLowerCase())
        const textSize = context.measureText(label)
        context.fillText(
          label,
          col * squareSize + squareSize / 2 - textSize.width / 2,
          row * squareSize + squareSize / 2 + textSize.actualBoundingBoxAscent / 2
        )
      }
    }
  }

  const onPrint = () => {
    window.print()
  }

  function setDPI(canvas, dpi) {
    // Set up CSS size.
    canvas.style.width = canvas.style.width || canvas.width + 'px'
    canvas.style.height = canvas.style.height || canvas.height + 'px'

    // Resize canvas and scale future draws.
    var scaleFactor = dpi / 96
    canvas.width = Math.ceil(canvas.width * scaleFactor)
    canvas.height = Math.ceil(canvas.height * scaleFactor)
    var ctx = canvas.getContext('2d')
    ctx.scale(scaleFactor, scaleFactor)
  }
</script>

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
    font-size: 3em;
  }

  canvas {
    border: 1px solid grey;
    margin: auto;
  }

  table {
    margin: 0.4rem auto;
    min-width: 200px;
    text-align: left;
  }

  input {
    margin-bottom: 1rem;
  }

  .preview {
    position: absolute;
    opacity: 0;
  }

  .settings {
    margin: auto;
    max-width: 400px;
    text-align: left;
  }

  .spacer {
    flex: 1;
  }

  @media print {
    .print-hide {
      display: none;
    }
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

<main>
  <h1 class="print-hide">Color By Pixel</h1>
  <div class="print-hide settings">
    <div class="preview" id="preview" />
    <div style="display: flex; flex-direction: row; justify-content: space-between">
      <label for="image">Upload Image:</label>
      {#if uniqueColors.length}
        <span role="img" aria-label="print" alt="print" on:click={onPrint}>🖨</span>
      {/if}
    </div>
    <input class="nes-input" type="file" id="image" name="image" accept="image/png, image/gif" on:change={setImage} />
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </div>
  <canvas id="art" class="print-hide" />
  <br />
  <canvas id="color-sheet" />
  <table>
    <tbody>
      {#each uniqueColors as uniqueColor, index}
        <tr>
          <td>{index}: {uniqueColor}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="spacer" />
  <Footer />
</main>
