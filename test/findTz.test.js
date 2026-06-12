import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('whereits', () => {
  let tzs = spacetime.whereIts('9am')
  assert.ok(tzs.length > 0, '9am somewhere')
  assert.ok(tzs.length < 90, '9am-is-subset')
  tzs = spacetime.whereIts('10am')
  assert.ok(tzs.length > 0, '10am somewhere')
  assert.ok(tzs.length < 90, '10am-is-subset')
  tzs = spacetime.whereIts('8pm')
  assert.ok(tzs.length > 0, '8pm somewhere')
  assert.ok(tzs.length < 90, '8pm-is-subset')
  tzs = spacetime.whereIts('11pm')
  assert.ok(tzs.length > 0, '11pm somewhere')
  assert.ok(tzs.length < 90, '11pm-is-subset')

  tzs = spacetime.whereIts('9:00am', '11:00am')
  assert.ok(tzs.length > 0, '9am-11am somewhere')
  assert.ok(tzs.length < 120, '9am-11am-is-subset')

  tzs = spacetime.whereIts('9am', '11pm')
  assert.ok(tzs.length > 0, '9am-11pm somewhere')
  assert.ok(tzs.length < 503, '9am-11pm-is-subset')

  tzs = spacetime.whereIts('8pm', '11pm')
  assert.ok(tzs.length > 0, '8pm-11pm somewhere')
  assert.ok(tzs.length < 503, '8pm-11pm-is-subset')

  tzs = spacetime.whereIts('8pm', '7pm')
  assert.ok(tzs.length === 0, '8pm-7pm nowhere')

  tzs = spacetime.whereIts('8pm', '7am')
  assert.ok(tzs.length === 0, '8pm-apm nowhere')

})

test('get all timezones method', () => {
  const obj = spacetime.timezones()
  assert.ok(Object.keys(obj).length > 60, 'got a lot of timezones')
  assert.equal(
    typeof obj['america/st_vincent'].offset,
    'number',
    'got a list of timeszones with offsets'
  )
})

test('throw-error-on-invalid', () => {
  try {
    spacetime('12pm', 'invalid-timezone')
    assert.ok(false, 'did-not-throw-exception')
  } catch (e) {
    assert.ok(true, 'threw-exception-on-input')
  }
  try {
    spacetime.now().goto('canada/nope')
    assert.ok(false, 'goto-did-not-throw-exception')
  } catch (e) {
    assert.ok(true, 'threw-exception-on-goto')
  }
})
