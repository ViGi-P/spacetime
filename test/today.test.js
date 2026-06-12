import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('change assumed year', function () {
  const today = {
    year: 1996
  }
  const s = spacetime('June 5th', null, { today: today })
  assert.equal(s.format('nice-year'), 'Jun 5th, 1996', 'got year')
})

test('change assumed month', function () {
  const today = {
    month: 2
  }
  const s = spacetime('2019', null, { today: today })
  assert.equal(s.format('nice-year'), 'Mar 1st, 2019', 'got month')
})

test('change assumed date', function () {
  const today = {
    date: 2
  }
  const s = spacetime('June 2020', null, { today: today })
  assert.equal(s.format('nice-year'), 'Jun 2nd, 2020', 'got date')
})

test('null input w/ today', function () {
  let s = spacetime(null, null, { today: { year: 2012, month: 2 } })
  assert.equal(s.format('nice-year'), 'Mar 1st, 2012', 'got date')

  s = spacetime('', 'Canada/Eastern', { today: { year: 1999, month: 0, date: 28 } })
  assert.equal(s.format('nice-year'), 'Jan 28th, 1999', 'got date')

})

test('today passthrough', function () {
  let d = spacetime('03/02', '-2h', { today: { date: 21, month: 0, year: 2018 } })
  assert.equal(d.iso(), '2018-03-02T00:00:00.000-02:00', '03/02')

  d = spacetime('summer', '-2h', { today: { date: 21, month: 0, year: 2018 } })
  assert.equal(d.iso(), '2018-06-01T00:00:00.000-02:00', 'summer')

  d = spacetime('q2', '-2h', { today: { date: 21, month: 0, year: 2018 } })
  assert.equal(d.iso(), '2018-04-01T00:00:00.000-02:00', 'q2')
})

test('today methods works', function () {
  const today = {
    date: 2,
    month: 'feb',
    year: 2012
  }
  let s = spacetime.now(null, { today: today })
  assert.equal(s.format('nice-year'), 'Feb 2nd, 2012', 'now method')
  s = spacetime.today(null, { today: today })
  assert.equal(s.format('nice-year'), 'Feb 2nd, 2012', 'today method')
  s = spacetime.tomorrow(null, { today: today })
  assert.equal(s.format('nice-year'), 'Feb 3rd, 2012', 'tomorrow method')
  s = spacetime.yesterday(null, { today: today })
  assert.equal(s.format('nice-year'), 'Feb 1st, 2012', 'yesterday method')
})
