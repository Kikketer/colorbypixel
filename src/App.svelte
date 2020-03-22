<script>
  import Jimp from 'jimp/browser/lib/jimp'
  import _ from 'lodash'
  import ntc from './ntc'
  import Footer from './Footer.svelte'
  import Settings from './Settings.svelte'

  let uniqueColors = []
  let error = ''

  const componentToHex = c => {
    var hex = c.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const rgbToHex = (r, g, b) => {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  }

  const onImageSet = async (img, file, palette) => {
    const reader = new FileReader()
    // reader.onload = iImg => event => (iImg.src = event.target.result)(img)
    reader.onload = event => {
      img.src = event.target.result
      try {
        onPreviewLoaded(img)

        const otherReader = new FileReader()
        otherReader.onload = async event => {
          getImageAsColorNames(event.target.result, img.offsetWidth, img.offsetHeight, palette)
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

  const readAndReturnColorName = (jimpImage, x, y, palette) => {
    const colorHex = jimpImage.getPixelColor(x, y)

    const rgba = Jimp.intToRGBA(colorHex)
    if (rgba.a < 255) {
      return ntc.name('#ffffff', palette)
    }

    const cssHex = rgbToHex(rgba.r, rgba.g, rgba.b)
    return ntc.name(cssHex, palette)
  }

  const getImageAsColorNames = async (buffer, width, height, palette) => {
    const jimpImage = await Jimp.read(buffer)

    const imageAsColorNames = []

    for (let row = 0; row < height; row++) {
      if (!imageAsColorNames[row]) {
        imageAsColorNames[row] = []
      }

      for (let column = 0; column < width; column++) {
        imageAsColorNames[row].push(readAndReturnColorName(jimpImage, column, row, palette))
      }
    }

    const flattenedColors = _.flatten(imageAsColorNames)
    const mappedColors = flattenedColors.map(ob => ({ name: ob.name, hex: ob.hex }))
    const filteredColors = mappedColors.filter(c => c.name.toLowerCase() !== 'white')
    const unionedColors = _.unionBy(filteredColors, 'name')
    uniqueColors = unionedColors

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
        context.fillStyle = imageAsColorNames[row][col].hex
        context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize)

        context.font = '8px "Press Start 2P", sans-serif'
        context.fillStyle = '#ffffff' //ntc.LightenDarkenColor('#dedede', -10)
        const label = uniqueColors
          .map(c => c.name.toLowerCase())
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

  const drawColorSheet = imageAsColorNames => {
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
            .map(c => c.name.toLowerCase())
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

  .spacer {
    flex: 1;
  }

  .color-block {
    width: 1rem;
    height: 1rem;
    border: 1px solid #d3d3d3;
    display: inline-block;
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

<main>
  <h1 class="print-hide">32 Colors</h1>
  <Settings class="print-hide" {uniqueColors} {error} {onImageSet} />
  <canvas id="art" class="print-hide" />
  <br />
  <canvas id="color-sheet" />
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

  <div class="spacer" />
  <Footer />
</main>
