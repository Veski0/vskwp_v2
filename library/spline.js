const Spline = require('cubic-spline')

const fitSpline = (data, factor) => {
  console.log('fitting a spline', 'this may take some time')
  const spline = new Spline(data.x, data.y)
  const fitted = { x: [], y: [] }
  for (let i = 0; i < data.x.length * factor; i++) {
    fitted.x.push(i / factor)
    fitted.y.push(spline.at(i / factor))
  }
  return fitted
}

module.exports = { fitSpline }
