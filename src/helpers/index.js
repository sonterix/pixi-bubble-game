// Get random number (min and max included)
export const getRandomNubmer = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Get random color
export const getRnadomColor = () => {
  const colors = [0xb3e0e5, 0x95d4da, 0x064273, 0x7fcdff, 0x1da2d8]
  const randomColor = colors[getRandomNubmer(0, colors.length - 1)]
  return randomColor
}
