// ------------------------------------------------------- Functional Primitives

const head          = a => a[0]
const tail          = a => a.length == 0 ? errlistEmpty() : a.length == 1 ? [] : a.slice(1)
const init          = a => a.length == 0 ? errlistEmpty() : a.length == 1 ? [] : a.slice(0, a.length - 2)
const last          = a => a.length == 0 ? errlistEmpty() : a[a.length - 1]
const addλ          = (a) => (b) => a + b
const add           = (a, b) => a + b
const mulλ          = (a) => (b) => a * b
const mul           = (a, b) => a * b
const show          = (a) => ">> " + (a)
const gtλ           = (b) => (a) => a < b
const gt            = (a, b) => a > b
const ltλ           = (b) => (a) => a < b
const lt            = (a, b) => a < b

const zip           = (fn, a, b) => a.map((k, i) => fn(k, b[i]))
const zipλ          = (fn) => (a, b) => a.map((k, i) => fn(k, b[i]))
const composeFnGnλ  = (fn, gn) => (...args) => gn(fn(...args))
const composeGnFnλ  = (fn, gn) => (...args) => fn(gn(...args))
const composeL      = (...fns) => fns.reduce(composeFnGnλ, (_) => _)
const composeR      = (...fns) => fns.reduce(composeGnFnλ, (_) => _)
const applyλ        = (...fns) => (...args) => compose(fns)(args)
const sum           = (...args) => args.reduce((acc, cur) => acc + cur)
const dot           = (...args) => args.reduce((acc, cur) => acc * cur)
const reach         = (a, b) => a.filter(gtλ(b))
const repeat        = (a, n) => Array(n).fill(a)

const randomR = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const randomW = (weights) => reach(weights, Math.random())

const errlistEmpty = _ => {
  console.trace("functional.js List Error: Empty List ...")
  process.exit()
}

module.exports = {
  head,
  tail,
  init,
  last,
  addλ,
  add,
  mulλ,
  mul,
  show,
  gtλ,
  gt,
  ltλ,
  lt,
  zip,
  zipλ,
  composeFnGnλ,
  composeGnFnλ,
  composeL,
  composeR,
  applyλ,
  sum,
  dot,
  reach,
  repeat,
  randomR,
  randomW
}
