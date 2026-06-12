import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('add', () => {
  let s = spacetime('January 1, 2017 1:20:05', 'Canada/Eastern')
  //initial state
  assert.equal(s.date(), 1, '.date()')
  assert.equal(s.monthName(), 'january', '.month()')
  assert.equal(s.year(), 2017, '.year()')
  assert.equal(s.hour(), 1, '.hour()')
  assert.equal(s.minute(), 20, '.minute()')
  assert.equal(s.dayName(), 'sunday', '.day()')

  s = s.add(1, 'hour')
  assert.equal(s.hour(), 2, 'movehour-.hour()')
  assert.equal(s.minute(), 20, 'movehour-.minute()')
  assert.equal(s.date(), 1, 'movehour-.date()')
  assert.equal(s.month(), 0, 'movehour-.month()')
  assert.equal(s.year(), 2017, 'movehour-.year()')

  s = s.add(1, 'month')
  assert.equal(s.date(), 1, 'movemonth.date()')
  assert.equal(s.monthName(), 'february', 'movemonth.month()')
  assert.equal(s.year(), 2017, 'movemonth.year()')

  s = s.add(2, 'days')
  assert.equal(s.date(), 3, 'moveday-.date()')
  assert.equal(s.monthName(), 'february', 'moveday-.month()')
  assert.equal(s.year(), 2017, 'moveday-.year()')
  assert.equal(s.dayName(), 'friday', 'moveday-.day()')

  s = s.add(1, 'week')
  assert.equal(s.date(), 10, 'moveweek-.date()')
  assert.equal(s.monthName(), 'february', 'moveweek-.month()')
  assert.equal(s.year(), 2017, 'moveweek-.year()')
  assert.equal(s.dayName(), 'friday', 'moveweek-.day()')

  s = s.add(1, 'year')
  assert.equal(s.date(), 10, 'moveyear.date()')
  assert.equal(s.monthName(), 'february', 'moveyear.month()')
  assert.equal(s.year(), 2018, 'moveyear.year()')

  s = spacetime('January 1, 2017 1:20:05', 'Canada/Eastern')
  // s.add(1, 'quarter');
  // assert.equal(s.date(), 1, 'movequarter.date()');
  // assert.equal(s.monthName(), 'april', 'movequarter.date()');
  s = s.add(2, 'years')
  assert.equal(s.date(), 1, 'moveyear-.date()')
  // assert.equal(s.monthName(), 'april', 'moveyear.month()');
  assert.equal(s.year(), 2019, 'moveyear.year()')

  s = s.add(1, 'decade')
  assert.equal(s.year(), 2029, 'move-decade.year()')

  s = s.add(1, 'quarterHour')
  assert.equal(s.minute(), 35, 'movequarterHour')

  s = s.add(1, 'quarterHour')
  assert.equal(s.minute(), 50, 'movequarterHour#2')

  s = s.time('3:31pm')
  s = s.add(4, 'quarter-hour')
  assert.equal(s.time(), '4:31pm', 'add 2 quarter-hours')

})

test('adding 0 changes nothing', () => {
  let s = spacetime.now()
  const a = s.clone()
  s = s.add(0, 'month')
  s = s.add(0, 'day')
  s = s.add(0, 'week')
  s = s.add(0, 'year')
  s = s.add(0, 'hour')
  s = s.add(0, 'minute')
  s = s.minus(0, 'minute')
  s = s.minus(0, 'days')
  assert.equal(s.epoch, a.epoch, 'time-didnt change')

  s = spacetime('dec 25 2018')
  const before = s.format('nice-year')
  s = s.add(0, 'years')
  assert.equal(s.format('nice-year'), before, 'year didnt change')
})

test('hour-tricky', () => {
  let s = spacetime('January 1, 2017 13:20:00', 'Canada/Pacific')
  assert.equal(s.hour(), 13, 'init.hour()')
  assert.equal(s.minute(), 20, 'init.minute()')

  s = s.add(1, 'hour')
  assert.equal(s.hour(), 14, '.hour()')
  assert.equal(s.minute(), 20, '.minute()')
})

test('day-tricky', () => {
  let d = spacetime('2019-11-04T00:00:00.000', 'Canada/Eastern')
  d = d.add(1, 'week')
  assert.equal(d.format('nice-day'), 'Mon Nov 11th', 'add week over dst-change')

  //same thing, but days
  d = spacetime('2019-11-04T00:00:00.000', 'Canada/Eastern')
  d = d.add(7, 'days')
  assert.equal(d.format('nice-day'), 'Mon Nov 11th', 'add days over dst-change')

  d = spacetime('2021-10-31T00:00:00.000', 'Europe/London')
  d = d.add(1, 'day')
  assert.equal(d.format('iso-utc'), '2021-11-01T00:00:00.000Z', 'add 1 day over dst-change')

  // add day over month-change
  let s = spacetime('Oct 31 2020', 'Canada/Eastern')
  s = s.add(2, 'day')
  assert.equal(s.format('nice'), 'Nov 2nd, 12:00am', 'add day over month-change')
  // add day over year-change
  s = spacetime('Dec 31 2020', 'Canada/Eastern')
  s = s.add(2, 'day')
  assert.equal(s.format('nice'), 'Jan 2nd, 12:00am', 'add day over year-change')

})

test('new-years-eve', () => {
  let year = 2022
  let nye = spacetime(`2022-01-01T00:00:00.000Z`)
  for (let i = 0; i < 20; i += 1) {
    nye = nye.minus(1, 'year')
    year -= 1
    assert.equal(nye.format(), `${year}-01-01`, `${year} exact millisecond`)
  }
})

test('add-weekend', () => {
  let d = spacetime('2021-04-17')
  d = d.add(1, 'weekend')
  assert.equal(d.dayName(), 'saturday', 'is saturday')
  assert.equal(d.format('iso-short'), '2021-04-24', 'is ahead')
})

test('add-30-years', () => {
  let d = spacetime('2000-01-01 00:00:00')
  d = d.add(30, 'year')
  assert.equal(d.format('iso-short'), '2030-01-01', 'plus 30 years')
})

test('year-tricky', () => {
  const s = spacetime(1451667600000, 'Canada/Eastern') //jan 1 2016 (leap year)
  assert.equal(s.year(), 2016, 'year1')

  const a = s.clone().add(1, 'year')
  assert.equal(a.year(), 2017, 'year-next')

  const b = s.clone().subtract(1, 'year')
  assert.equal(b.year(), 2015, 'year-last')
})
