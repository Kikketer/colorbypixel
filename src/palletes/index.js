import classic from './classic'
import classicNES from './classic-NES'

const palettes = [
  {
    id: 'classic',
    name: 'Classic 16 Colors',
    description: 'Classic 16 color marker pack',
    colors: classic,
    buy:
      'https://www.amazon.com/Crayola-Markers-Classroom-Educational-All-Purpose/dp/B0002T3WLS/ref=sr_1_7?keywords=crayola+classic+markers&qid=1584398315&sr=8-7&swrs=5C67007123F0D2E375C3AE19D9EB3344'
  },
  {
    id: 'classic-nes',
    name: 'Classic 16 Colors for NES Sprites',
    description: 'Classic 16 color marker pack but slightly refined to better accommodate NES game sprites.',
    colors: classicNES,
    buy:
      'https://www.amazon.com/Crayola-Markers-Classroom-Educational-All-Purpose/dp/B0002T3WLS/ref=sr_1_7?keywords=crayola+classic+markers&qid=1584398315&sr=8-7&swrs=5C67007123F0D2E375C3AE19D9EB3344'
  }
]

const getById = id => {
  return palettes.find(palette => palette.id === id)
}

export default palettes

export { getById }
