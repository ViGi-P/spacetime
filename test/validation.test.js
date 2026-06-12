import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('large date numbers', function () {
  let d = spacetime([2019, 'february'])
  d = d.date(30)
  assert.equal(d.date(), 28, 'feb is <= 28')

  d = spacetime([2019, 'june'])
  d = d.date(300)
  assert.equal(d.date(), 30, 'june is <= 30')

  d = spacetime([2022, 'december', 900])
  assert.equal(d.date(), 31, 'dec is <= 31')
})

test('small date numbers', function () {
  let d = spacetime([2019, 'february'])
  d = d.date(0)
  assert.equal(d.date(), 1, 'date is >= 1')

  d = d.date(-10)
  assert.equal(d.date(), 1, 'date is still >= 1')

  d = spacetime([2022, 'december', 0])
  assert.equal(d.date(), 1, 'dec is >= 1')

})

test('large month numbers', function () {
  let d = spacetime([2019])
  d = d.month(14)
  assert.equal(d.monthName(), 'december', 'month is <= december')

  d = spacetime([2019])
  d = d.month(-14)
  assert.equal(d.monthName(), 'january', 'month is >= january')

  d = spacetime([2019, 13, 5])
  assert.equal(d.monthName(), 'december', 'array-set month is <= december')
  assert.equal(d.date(), 5, 'date is still valid')
})
