const tape = require('tape')
const { E, isError } = require('../library/err')


// =============================================================================
//    Helpers
// =============================================================================


tape('[Function: E] creates an Error object from a string and return it', (t) => {
  t.plan(2)
  const result = E('hello')
  t.equals(result instanceof Error, true)
  t.equals(result.message, 'hello')
})


tape('[Function: isError] determines if an object in an error or not', (t) => {
  t.plan(2)
  const error = E('error test')
  const notAnError = { some: 'object' }
  t.equals(isError(error), true)
  t.equals(isError(notAnError), false)
})
