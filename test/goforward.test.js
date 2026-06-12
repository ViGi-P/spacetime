import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('goForward [time]', () => {
  const d = spacetime('march 17 2021').time('3:20pm')
  let s = d.time('2:32pm')
  assert.equal(s.format('nice'), 'Mar 17th, 2:32pm', '[time] goForward=null bckwd')
  s = d.time('4:32pm')
  assert.equal(s.format('nice'), 'Mar 17th, 4:32pm', '[time] goForward=null fwd')

  s = d.time('4:32pm', true)
  assert.equal(s.format('nice'), 'Mar 17th, 4:32pm', '[time] goForward-notick')
  s = d.time('2:32pm', true)
  assert.equal(s.format('nice'), 'Mar 18th, 2:32pm', '[time] goForward-tick')

  s = d.time('2:32pm', false)
  assert.equal(s.format('nice'), 'Mar 17th, 2:32pm', '[time] goForward=false notick')
  s = d.time('4:32pm', false)
  assert.equal(s.format('nice'), 'Mar 16th, 4:32pm', '[time] goForward=false tick')

})

test('goForward ', () => {
  const arr = [
    ['second', '8', '12'],
    ['minute', '4', '12'],
    ['hour', '3', '5'],
    ['time', '2:43', '2:52'],
    ['date', '3', '5'],
    ['hourFloat', '3.5', '3.7'],
    ['hour12', '9pm', '10pm'],
    ['ampm', 'am', 'pm'],
    ['dayTime', 'breakfast', 'dinner'],
    ['day', 2, 3],
    ['dayName', 'wednesday', 'thurs'],
    ['dayOfYear', 23, 24],
    ['week', 23, 24],
    ['month', 3, 6],
    ['monthName', 'june', 'sep'],
    ['quarter', 'q2', 'q4'],
    ['season', 'spring', 'fall']
  ]
  arr.forEach((a) => {
    const fn = a[0]
    const s = spacetime.now()[fn](a[1])
    // normal after
    const after = s[fn](a[2])
    assert.equal(s.isBefore(after), true, `[${fn}] fwd-null`)
    // after-true
    const fwd = s[fn](a[2], true)
    assert.equal(s.isBefore(fwd), true, `[${fn}] fwd`)
    // after-false (skip back)
    const bkwd = s[fn](a[2], false)
    assert.equal(s.isAfter(bkwd), true, `[${fn}] bkwd`)

    // after->before (definetly)
    const before = after[fn](a[1], false)
    assert.equal(before.isBefore(after), true, `[${fn}] go-back-true`)
    const notBefore = after[fn](a[1], true)
    assert.equal(notBefore.isBefore(after), false, `[${fn}] go-back-false`)
  })
})
