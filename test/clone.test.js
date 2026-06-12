import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('clone', () => {
  let a = spacetime('March 18, 1999 23:42:00', 'Canada/Eastern')
  let b = a.clone()
  assert.equal(a.date(), 18, 'start-date')
  assert.equal(a.hour(), 23, 'start hour')
  assert.equal(a.isSame(b, 'hour'), true, 'same-hour')

  a = a.hour(7)
  assert.equal(a.hour(), 7, 'new-hour')
  assert.equal(b.hour(), 23, 'old-hour')

  b = b.date(17)
  assert.equal(b.date(), 17, 'new-date')
  assert.equal(a.date(), 18, 'old-date')

})
