import { test } from 'node:test'
import assert from '../lib/assert.js'
import { spacetime } from './spacetime-static'

test('Spacetime base properties exist', () => {
  const obj = spacetime.now()

  assert.ok(obj.d instanceof Date, '.d is a date')
  assert.equal(typeof obj.epoch, 'number', '.epoch is a number')
  assert.equal(typeof obj.silent, 'boolean', '.silent is a boolean')
  assert.equal(typeof obj.tz, 'string', '.tz is a string')
  assert.ok(obj.timezones != undefined, '.timezones exists')
})

test('era getter/setter types', () => {
  const obj = spacetime.now()
  const era: 'BC' | 'AD' = obj.era()
  assert.ok(era === 'BC' || era === 'AD', '.era() returns BC/AD')
  assert.equal(typeof obj.era('bc').epoch, 'number', '.era(value) returns a Spacetime')
})
