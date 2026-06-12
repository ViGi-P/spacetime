import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('nearest', () => {
  const s = spacetime('jan 2 2019', 'Canada/Eastern')
  const month = s.nearest('month')
  const year = s.nearest('year')
  const quarter = s.nearest('quarter')
  assert.equal(month.format('iso'), year.format('iso'), 'nearest year=nearest month')
  assert.equal(quarter.format('iso'), year.format('iso'), 'nearest quarter=nearest month')
})

test('nearest-time', () => {
  let s = spacetime('feb 20 2017', 'Canada/Pacific')
  s = s.time('3:29am')
  const hour = s.nearest('hour')
  assert.equal(hour.format('time'), '3:00am', 'close-call nearest-hour')
})

test('nearest-quarter-hour', () => {
  let s = spacetime([2019, 4, 8, 10, 11, 12], 'Canada/Eastern')
  s = s.nearest('quarter-hour')
  assert.equal(s.format('iso'), '2019-05-08T10:15:00.000-04:00', 'nearest-quarterhour')
})
