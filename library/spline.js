const Spline = require('cubic-spline')

const fitSpline = (data, factor) => {
  console.log('Spline fitting takes a few seconds...')
  const spline = new Spline(data.x, data.y)
  const fitted = { x: [], y: [] }
  for (let i = 0; i < data.x.length * factor; i++) {
    fitted.x.push(i / factor)
    fitted.y.push(spline.at(i / factor))
  }
  return fitted
}

module.exports = { fitSpline }
