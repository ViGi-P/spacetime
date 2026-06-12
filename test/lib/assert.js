import { isDeepStrictEqual, inspect } from 'node:util'

// tape-style 'soft' assertions for node:test.
// each assertion prints one flat tap line (like tape did), so tap-dancer
// renders the same per-assertion dots + counts as before.
// failures don't throw - the test keeps running, and we flunk the process instead.
let count = 0

const fmt = function (val) {
  if (typeof val === 'string') {
    return `'${val}'`
  }
  return inspect(val, { breakLength: Infinity }).replace(/\n/g, ' ')
}

// find the test-file callsite, for the 'at:' diagnostic
const getCallSite = function () {
  const err = new Error()
  const lines = (err.stack || '').split('\n').slice(1)
  let line = lines.find((str) => !str.includes('/lib/assert.js')) || ''
  line = line.trim().replace(/^at\s+/, '')
  if (!line.includes('(')) {
    line = `<anonymous> (${line})`
  }
  return line
}

const pass = function (msg) {
  count += 1
  process.stdout.write(`ok ${count} ${msg}\n`)
}

const fail = function (msg, info) {
  count += 1
  process.exitCode = 1
  let out = `not ok ${count} ${msg}\n`
  out += '  ---\n'
  out += `    operator: ${info.operator}\n`
  out += `    expected: ${fmt(info.expected)}\n`
  out += `    actual:   ${fmt(info.actual)}\n`
  out += `    at: ${getCallSite()}\n`
  out += '  ...\n'
  process.stdout.write(out)
}

const assert = function (isOk, msg, info) {
  if (isOk) {
    pass(msg)
  } else {
    fail(msg, info)
  }
}

export default {
  ok(value, msg = 'should be truthy') {
    assert(Boolean(value), msg, { operator: 'ok', expected: true, actual: value })
  },
  notOk(value, msg = 'should be falsy') {
    assert(!value, msg, { operator: 'notOk', expected: false, actual: value })
  },
  equal(actual, expected, msg = 'should be equal') {
    assert(actual === expected, msg, { operator: 'equal', expected, actual })
  },
  notEqual(actual, expected, msg = 'should not be equal') {
    assert(actual !== expected, msg, { operator: 'notEqual', expected, actual })
  },
  deepEqual(actual, expected, msg = 'should be equivalent') {
    assert(isDeepStrictEqual(actual, expected), msg, { operator: 'deepEqual', expected, actual })
  },
  throws(fn, msg = 'should throw') {
    let err = null
    try {
      fn()
    } catch (e) {
      err = e
    }
    assert(err !== null, msg, { operator: 'throws', expected: 'an error', actual: undefined })
  },
  doesNotThrow(fn, msg = 'should not throw') {
    let err = null
    try {
      fn()
    } catch (e) {
      err = e
    }
    assert(err === null, msg, { operator: 'doesNotThrow', expected: undefined, actual: err })
  }
}
