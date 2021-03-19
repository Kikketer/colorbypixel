import Jimp from 'jimp/browser/lib/jimp'
import ntc from './ntc'
import _ from 'lodash'

const componentToHex = (c) => {
  var hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

const rgbToHex = (r, g, b) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
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
  const mappedColors = flattenedColors.map((ob) => ({ name: ob.name, hex: ob.hex }))
  const filteredColors = mappedColors.filter((c) => c.name.toLowerCase() !== 'white')
  const unionedColors = _.unionBy(filteredColors, 'name')

  return { unionedColors, imageAsColorNames }

  // drawArt(imageAsColorNames)
  // drawColorSheet(imageAsColorNames)
}

export { componentToHex, rgbToHex, getImageAsColorNames, readAndReturnColorName }
