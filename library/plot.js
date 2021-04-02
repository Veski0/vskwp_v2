const npl = require('nodeplotlib')

const dataToPlottable = data => {
  data.type = 'line'
  return [data]
}

const plot = data => {
  npl.plot(dataToPlottable(JSON.parse(JSON.stringify(data))))
}

const plotMany = (...manyData) => {
  manyData.map(data => stack(dataToPlottable(JSON.parse(JSON.stringify(data)))))
  plot()
}

module.exports = { plot, plotMany }
