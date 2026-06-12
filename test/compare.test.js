import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('compare', () => {
  const original = spacetime('March 28, 1999 20:42:00', 'Canada/Eastern')
  let d = original.clone()
  assert.equal(original.isEqual(d), true, 'originally-equal')
  assert.equal(original.isAfter(d), false, 'originally-not-after')
  assert.equal(original.isBefore(d), false, 'originally-is-before')

  d = d.date(29)
  assert.equal(original.isEqual(d), false, 'not-equal')
  assert.equal(original.isAfter(d), false, 'not-after')
  assert.equal(original.isBefore(d), true, 'is-before')

  d = d.subtract(2, 'months')
  assert.equal(original.isEqual(d), false, 'now-not-equal')
  assert.equal(original.isAfter(d), true, 'now-is-after')
  assert.equal(original.isBefore(d), false, 'now-not-before')

  let start = original.clone()
  let end = original.clone()
  const startOfDay = start.startOf('day')
  const endOfDay = start.endOf('day')
  start = start.subtract(1, 'milliseconds')
  end = end.add(1, 'milliseconds')
  assert.equal(original.isBetween(start, end), true, 'originally-is-between')
  assert.equal(
    original.startOf('day').isBetween(startOfDay, endOfDay, true),
    true,
    'is-inclusive-of-start-time'
  )
})

test('dont leak milliseconds', () => {
  const inputs = [
    '2019-01-25T20:00:00+01:00',
    '2012-01-20',
    'June 5th, 1992',
    'June 5th',
    '2018/02/02'
  ]
  inputs.forEach((str) => {
    assert.equal(spacetime(str).isEqual(str), true, str)
  })
})

test('goto is still equal', () => {
  const original = spacetime('March 28, 1999 20:42:00', 'Canada/Eastern')
  const d = original.goto('Canada/Pacific')
  assert.equal(original.isEqual(d), true, 'originally-equal')
  assert.equal(original.isAfter(d), false, 'originally-not-after')
  assert.equal(original.isBefore(d), false, 'originally-is-before')
})

test('isEqual always boolean', () => {
  assert.equal(spacetime('1970-01-01', 'gmt').isEqual('1970-01-01', 'gmt'), true, 'isequal')
  assert.equal(spacetime('1970-01-02', 'gmt').isEqual('1970-01-02', 'gmt'), true, 'isequal')
  assert.equal(spacetime('1970-01-02', 'gmt').isEqual('1970-01-01', 'gmt'), false, 'isequal')
  assert.equal(spacetime('1970-01-01', 'gmt').isEqual('1970-01-02', 'gmt'), false, 'isequal')
})