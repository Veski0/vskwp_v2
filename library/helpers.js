const objectContainsArray = (array, object) =>
  array.filter(element => object.hasOwnProperty(element)).length === array.length

module.exports = {
  objectContainsArray
}
