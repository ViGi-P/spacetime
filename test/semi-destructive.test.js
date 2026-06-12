import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('non-destructive', () => {
  let s = spacetime([2017, 5, 25])
  s = s.seconds(5)
  s = s.year(2025)
  assert.equal(s.date(), 25, 'init-date')
  assert.equal(s.seconds(), 5, 'still-5-seconds')

  //but this method 0's-out things:
  s = s.quarter('q2')
  assert.equal(s.date(), 1, 'moved-date')
  assert.equal(s.seconds(), 0, 'now-not-5-seconds')
})

test('semi-destructive', () => {
  let s = spacetime('June 12, 2017 20:01:00', 'Australia/Brisbane')
  assert.equal(s.date(), 12, 'date-init')
  s = s.month('march')
  assert.equal(s.monthName(), 'march', 'now-march')
  assert.equal(s.date(), 12, 'still-12th')

  s = spacetime('June 30, 2017 20:01:00', 'Australia/Brisbane')
  assert.equal(s.date(), 30, 'date-init')
  s = s.month('february')
  assert.equal(s.monthName(), 'february', 'now-february')
  //close-as-possible
  assert.equal(s.date(), 28, 'now-28th')

})
