import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

//
test('subtract', () => {
  let s = spacetime('January 1, 2016 1:20:05', 'Canada/Eastern')
  //initial state
  assert.equal(s.date(), 1, '.date()')
  assert.equal(s.month(), 0, '.month()')
  assert.equal(s.year(), 2016, '.year()')
  assert.equal(s.hour(), 1, '.hour()')
  assert.equal(s.minute(), 20, '.minute()')

  s = s.subtract(1, 'month')
  assert.equal(s.date(), 1, 'movemonth.date()')
  assert.equal(s.month(), 11, 'movemonth.month()')
  assert.equal(s.year(), 2015, 'movemonth.year()')

  s = s.subtract(2, 'days')
  assert.equal(s.date(), 29, 'moveday.date()')
  assert.equal(s.monthName(), 'november', 'moveday.month()')
  assert.equal(s.year(), 2015, 'moveday.year()')
  assert.equal(s.dayName(), 'sunday', 'moveday.day()')

  s = s.subtract(1, 'week')
  assert.equal(s.date(), 22, 'moveweek.date()')
  assert.equal(s.monthName(), 'november', 'moveweek.month()')
  assert.equal(s.year(), 2015, 'moveweek.year()')
  assert.equal(s.dayName(), 'sunday', 'moveweek.day()')

  s = s.subtract(1, 'year')
  assert.equal(s.date(), 22, 'moveyear.date()')
  assert.equal(s.monthName(), 'november', 'moveyear.month()')
  assert.equal(s.year(), 2014, 'moveyear.year()')

})

test('subtract-rollover', () => {
  const s = spacetime('January 1, 2010 1:20:05', 'Canada/Pacific')

  let tmp = s.clone()
  tmp = tmp.subtract(8, 'hour')
  assert.equal(tmp.year(), 2009, 'minus-8-hours')

  tmp = s.clone()
  tmp = tmp.subtract(3, 'day')
  assert.equal(tmp.year(), 2009, 'minus-3-days')

  tmp = s.clone()
  tmp = tmp.subtract(1, 'month')
  assert.equal(tmp.year(), 2009, 'minus-1-month')

  tmp = s.clone()
  tmp = tmp.subtract(4, 'month')
  assert.equal(tmp.year(), 2009, 'minus-4-months-still-1-year')

  tmp = s.clone()
  tmp = tmp.subtract(13, 'month')
  assert.equal(tmp.year(), 2008, 'minus-13-months-2-years')

  tmp = s.clone()
  tmp = tmp.subtract(0, 'month')
  assert.equal(tmp.year(), 2010, 'minus-0-months-0-years')
  assert.equal(tmp.monthName(), s.monthName(), '0-months-same-month')
  assert.equal(tmp.date(), s.date(), '0-months-same-date')

  tmp = s.clone()
  tmp = tmp.subtract(12, 'month')
  assert.equal(tmp.year(), 2009, 'minus-12-months-1-years')
  assert.equal(tmp.monthName(), s.monthName(), '12-months-same-month')
  assert.equal(tmp.date(), s.date(), '12-months-same-date')

  tmp = s.clone()
  tmp = tmp.subtract(120, 'month')
  assert.equal(tmp.year(), 2000, 'minus-120-months-10-years')
  assert.equal(tmp.monthName(), s.monthName(), 'same-month')
  assert.equal(tmp.date(), s.date(), 'same-date')

})



test('month-rollover even', () => {
  const s = spacetime('jan 1 2022')

  let a = s.subtract(0, 'month');
  assert.equal(a.format('iso-short'), '2022-01-01', '0 years even')

  a = s.subtract(12, 'month');
  assert.equal(a.format('iso-short'), '2021-01-01', '1 years even')

  a = s.subtract(24, 'month');
  assert.equal(a.format('iso-short'), '2020-01-01', '2 years even')

  a = s.subtract(36, 'month');
  assert.equal(a.format('iso-short'), '2019-01-01', '3 years even')

  a = s.subtract(48, 'month');
  assert.equal(a.format('iso-short'), '2018-01-01', '4 years even')
})

test('month-rollover + 1', () => {
  const s = spacetime('jan 1 2022')

  let a = s.subtract(1, 'month');
  assert.equal(a.format('iso-short'), '2021-12-01', '0 years +1m')

  a = s.subtract(13, 'month');
  assert.equal(a.format('iso-short'), '2020-12-01', '1 years +1m')

  a = s.subtract(25, 'month');
  assert.equal(a.format('iso-short'), '2019-12-01', '2 years +1m')

  a = s.subtract(37, 'month');
  assert.equal(a.format('iso-short'), '2018-12-01', '3 years +1m')

  a = s.subtract(49, 'month');
  assert.equal(a.format('iso-short'), '2017-12-01', '4 years +1m')
})
