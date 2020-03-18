/*

+-----------------------------------------------------------------+
|     Created by Chirag Mehta - http://chir.ag/projects/ntc       |
|-----------------------------------------------------------------|
|               ntc js (Name that Color JavaScript)               |
+-----------------------------------------------------------------+

All the functions, code, lists etc. have been written specifically
for the Name that Color JavaScript by Chirag Mehta unless otherwise
specified.

This script is released under the: Creative Commons License:
Attribution 2.5 http://creativecommons.org/licenses/by/2.5/

Sample Usage:

  <script type="text/javascript" src="ntc.js"></script>

  <script type="text/javascript">

    var n_match  = ntc.name("#6195ED");
    n_rgb        = n_match[0]; // This is the RGB value of the closest matching color
    n_name       = n_match[1]; // This is the text string for the name of the match
    n_exactmatch = n_match[2]; // True if exact color match, False if close-match

    alert(n_match);

  </script>

*/

import { getById } from './palletes'
import _ from 'lodash'

var ndf1 = 0
var ndf2 = 0
var ndf = 0
var lookup = {}

const ntc = {
  initializePalette: palette => {
    var color, rgb, hsl
    const names = getById(palette)
    for (var i = 0; i < names.colors.length; i++) {
      color = '#' + names.colors[i][0]
      rgb = ntc.rgb(color)
      hsl = ntc.hsl(color)
      lookup[names.colors[i][1]] = parseInt(names.colors[i][0], 16)
      names.colors[i].push(rgb[0], rgb[1], rgb[2], hsl[0], hsl[1], hsl[2])
    }
    return names
  },

  value: function(name) {
    return lookup[name]
  },

  name: function(color, palette = 'classic') {
    const names = ntc.initializePalette(palette)
    color = color.toUpperCase()
    if (color.length < 3 || color.length > 7) return ['#000000', 'Invalid Color: ' + color, false]
    if (color.length % 3 == 0) color = '#' + color
    if (color.length == 4)
      color =
        '#' +
        color.substr(1, 1) +
        color.substr(1, 1) +
        color.substr(2, 1) +
        color.substr(2, 1) +
        color.substr(3, 1) +
        color.substr(3, 1)

    var rgb = ntc.rgb(color)
    var r = rgb[0],
      g = rgb[1],
      b = rgb[2]
    var hsl = ntc.hsl(color)
    var h = hsl[0],
      s = hsl[1],
      l = hsl[2]
    var cl = -1,
      df = -1

    for (var i = 0; i < names.colors.length; i++) {
      if (color == '#' + names.colors[i][0]) {
        const resultingColor = names.colors.find(
          nameObj => nameObj[1].toLowerCase() === names.colors[i][1].toLowerCase()
        )
        return { hex: '#' + resultingColor[0], name: resultingColor[1], exact: true, original: color }
      }

      ndf1 =
        Math.pow(r - names.colors[i][2], 2) + Math.pow(g - names.colors[i][3], 2) + Math.pow(b - names.colors[i][4], 2)
      ndf2 =
        Math.pow(h - names.colors[i][5], 2) + Math.pow(s - names.colors[i][6], 2) + Math.pow(l - names.colors[i][7], 2)
      ndf = ndf1 + ndf2 * 2
      if (df < 0 || df > ndf) {
        df = ndf
        cl = i
      }
    }

    // Pick the first hex for any matched colors (you can have multiple with the same name, like White)
    const resultingColor = names.colors.find(nameObj => nameObj[1].toLowerCase() === names.colors[cl][1].toLowerCase())

    return cl < 0
      ? { hex: '#000000', name: 'Invalid Color: ' + color, exact: false, original: color }
      : { hex: '#' + resultingColor[0], name: resultingColor[1], exact: false, original: color }
  },

  // adopted from: Farbtastic 1.2
  // http://acko.net/dev/farbtastic
  hsl: function(color) {
    var rgb = [
      parseInt('0x' + color.substring(1, 3)) / 255,
      parseInt('0x' + color.substring(3, 5)) / 255,
      parseInt('0x' + color.substring(5, 7)) / 255
    ]
    var min, max, delta, h, s, l
    var r = rgb[0],
      g = rgb[1],
      b = rgb[2]

    min = Math.min(r, Math.min(g, b))
    max = Math.max(r, Math.max(g, b))
    delta = max - min
    l = (min + max) / 2

    s = 0
    if (l > 0 && l < 1) s = delta / (l < 0.5 ? 2 * l : 2 - 2 * l)

    h = 0
    if (delta > 0) {
      if (max == r && max != g) h += (g - b) / delta
      if (max == g && max != b) h += 2 + (b - r) / delta
      if (max == b && max != r) h += 4 + (r - g) / delta
      h /= 6
    }
    return [parseInt(h * 255), parseInt(s * 255), parseInt(l * 255)]
  },

  // adopted from: Farbtastic 1.2
  // http://acko.net/dev/farbtastic
  rgb: function(color) {
    return [
      parseInt('0x' + color.substring(1, 3)),
      parseInt('0x' + color.substring(3, 5)),
      parseInt('0x' + color.substring(5, 7))
    ]
  },

  // names: palettes[palette].colors,
  LightenDarkenColor: (col, amt) => {
    var usePound = false
    if (col[0] === '#') {
      col = col.slice(1)
      usePound = true
    }

    var num = parseInt(col, 16)

    var r = (num >> 16) + amt

    if (r > 255) r = 255
    else if (r < 0) r = 0

    var b = ((num >> 8) & 0x00ff) + amt

    if (b > 255) b = 255
    else if (b < 0) b = 0

    var g = (num & 0x0000ff) + amt

    if (g > 255) g = 255
    else if (g < 0) g = 0

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
  }
}

// ntc.init()

export default ntc
