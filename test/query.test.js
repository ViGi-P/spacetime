import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('get', () => {
  const s = spacetime('February 22, 2017 15:30:00', 'Canada/Eastern')
  assert.equal(s.date(), 22, '.date()')
  assert.equal(s.year(), 2017, '.year()')
  assert.equal(s.quarter(), 1, '.quarter()')
  assert.equal(s.hour(), 15, '.hour()')
  assert.equal(s.ampm(), 'pm', '.ampm()')
  assert.equal(s.hourFloat(), 15.5, '.hourFloat()')
  assert.equal(s.minute(), 30, '.minute()')
  assert.equal(s.season(), 'winter', '.season()')
  assert.equal(s.monthName(), 'february', '.month()')
  assert.equal(s.dayName(), 'wednesday', '.day()')
})

test('get-quarters', () => {
  let s = spacetime('January 22, 2017 15:42:00', 'Canada/Eastern')
  assert.equal(s.quarter(), 1, '.quarter()')

  s = s.month(1)
  assert.equal(s.quarter(), 1, '.quarter()')

  s = s.month('march')
  assert.equal(s.quarter(), 1, '.quarter()')

  s = s.month(3)
  assert.equal(s.quarter(), 2, '.quarter()')

  s = s.month('december')
  assert.equal(s.quarter(), 4, '.quarter()')
})

test('get-weeks', () => {
  let s = spacetime('January 1, 2015 2:00:00', 'Canada/Eastern')
  assert.equal(s.week(), 1, '.weeks()1')
  s = s.month('december').date(29)
  assert.equal(s.week(), 52, '.weeks()3')
})

test('day-of-year', () => {
  let s = spacetime('January 5, 2017 2:00:00', 'Canada/Eastern')
  assert.equal(s.ampm(), 'am', '.date()')
  assert.equal(s.date(), 5, '.date()')
  assert.equal(s.dayOfYear(), 5, 'jan-5th()')

  s = spacetime('February 1, 2017 2:00:00', 'Canada/Eastern')
  assert.equal(s.dayOfYear(), 32, 'feb 1()')

  s = spacetime('February 11, 2017 2:00:00', 'Canada/Eastern')
  assert.equal(s.dayOfYear(), 42, 'feb 1()')

  //after feb29th, there could be a leapyear
  // s = spacetime('December 31, 2017 2:00:00', 'Canada/Eastern');
  // assert.equal(s.dayOfYear(), 364, 'December 31()');

})
