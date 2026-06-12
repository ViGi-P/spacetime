import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('progress', () => {
  let d = spacetime('December 31, 1999 23:59:58', 'Canada/Eastern')
  let obj = d.progress()
  assert.ok(obj.year > 0.95, 'almost-done-year')
  assert.ok(obj.quarter > 0.9, 'almost-done-quarter')
  assert.ok(obj.month > 0.9, 'almost-done-month')
  assert.ok(obj.week > 0.7, 'almost-done-week') //friday
  assert.ok(obj.day > 0.95, 'almost-done-day')
  assert.ok(obj.quarterHour > 0.9, 'almost-done-hour')
  assert.ok(obj.hour > 0.95, 'almost-done-hour')
  assert.ok(obj.minute > 0.95, 'almost-done-minute')

  d = d.startOf('year')
  obj = d.progress()
  assert.ok(obj.year <= 0.1, 'just-starting-year')
  assert.ok(obj.month <= 0.1, 'just-starting-month')
  assert.ok(obj.day <= 0.1, 'just-starting-day')
  assert.ok(obj.hour <= 0.1, 'just-starting-hour')
  assert.ok(obj.minute <= 0.1, 'just-starting-minute')
})

test('progress-param', () => {
  const s = spacetime('jan 2 2019', 'Canada/Eastern')
  assert.equal(s.progress('year'), 0, 'start-year')
  assert.equal(s.progress('month'), 0.03, 'early-month')
})
