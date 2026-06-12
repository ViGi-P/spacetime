import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('isAwake', () => {
  let s = spacetime('March 26, 1999 13:42:00', 'Canada/Eastern')
  assert.equal(s.isAwake(), true, 'awake')
  s = spacetime('March 26, 1999 23:42:00', 'Canada/Eastern')
  assert.equal(s.isAwake(), false, 'sleeping')
})

test('asleep-test', () => {
  let s = spacetime.now()
  s = s.dayTime('night')
  assert.equal(s.isAsleep(), true, 'sleeping at night')
  s = s.hour(2)
  assert.equal(s.isAsleep(), true, 'sleeping at 2am')
  s = s.hour12(4)
  assert.equal(s.isAsleep(), true, 'sleeping at 4am')
  s = s.dayTime('lunch')
  assert.equal(s.isAsleep(), false, 'awake at lunch')
  s = s.hour24(14)
  assert.equal(s.isAsleep(), false, 'awake at 2pm')
  s = s.dayTime('evening')
  assert.equal(s.isAsleep(), false, 'awake at evening')
})

test('named-dates', () => {
  const christmas = spacetime('christmas', 'Canada/Eastern')
  const newYears = spacetime('new years', 'Canada/Eastern')
  assert.equal(christmas.isBefore(newYears), true, 'christmas-is-before-new-years')
})

test('nearest', () => {
  let s = spacetime('Nov 2')
  s = s.nearest('month')
  assert.equal(s.monthName(), 'november', 'nov')
  assert.equal(s.date(), 1, 'nov 1')

  s = spacetime('Nov 23')
  s = s.nearest('month')
  assert.equal(s.monthName(), 'december', 'dec')
  assert.equal(s.date(), 1, 'dec 1')
})

test('next', () => {
  let s = spacetime('Nov 2')
  s = s.next('month')
  assert.equal(s.monthName(), 'december', 'dec')
  assert.equal(s.date(), 1, 'dec 1')

  s = spacetime('Nov 23 1922')
  s = s.next('year')
  assert.equal(s.monthName(), 'january', 'jan')
  assert.equal(s.year(), 1923, 'now 1933')

  s = spacetime('Nov 23 1998')
  s = s.next('decade')
  assert.equal(s.year(), 2000, 'now 2000')
  assert.equal(s.monthName(), 'january', 'jan')
})

test('last', () => {
  let s = spacetime('Nov 2')
  s = s.last('month')
  assert.equal(s.monthName(), 'october', 'oct')
  assert.equal(s.date(), 1, 'oct 1')

  s = spacetime('Nov 23 1922')
  s = s.last('year')
  assert.equal(s.monthName(), 'january', 'jan')
  assert.equal(s.year(), 1921, 'now 1921')
})

test('offset', () => {
  let s = spacetime('Oct 12 2020', 'America/New_York')
  assert.equal(s.offset(), -240, '-240 offset')

  s = spacetime('march 1 2020', 'America/New_York')
  assert.equal(s.offset(), -300, '-300 offset')
})

test('week number', () => {
  //TODO: these should pass
  assert.equal(spacetime('jan 1st 2018').week(), 1, '2018 first week') //monday
  assert.equal(spacetime('jan 9th 2018').week(), 2, '2018 second week') //tuesday
  // assert.equal(spacetime('jan 15th 2018').week(), 3, '2018 third week') //monday

  assert.equal(spacetime('jan 1th 2019').week(), 1, '2019 first week') //tuesday
  // assert.equal(spacetime('jan 9th 2019').week(), 2, '2019 second week') //wednesday
  // assert.equal(spacetime('jan 15th 2019').week(), 3, '2019 third week') //tuesday
})

test('json', () => {
  const s = spacetime('2019-11-05T11:01:03.030-03:00')
  const json = s.format('json')
  const want = {
    century: 21,
    decade: 2010,
    year: 2019,
    month: 10,
    date: 5,
    day: 2,
    hour: 11,
    minute: 1,
    second: 3,
    millisecond: 30
  }
  Object.keys(want).forEach((k) => {
    assert.equal(want[k], json[k], 'json-' + k)
  })
})

test('set-time rollover dst', () => {
  const s = spacetime('6 October 2019', 'australia/sydney').time('4:20am')
  assert.equal(s.date(), 6, 'still the 6th')
  assert.equal(s.time(), '4:20am', 'correct time')
})

test('day aliases', () => {
  let s = spacetime().day('thurs')
  assert.equal(s.format('day'), 'Thursday', 'thurs')
  s = spacetime().day('tues')
  assert.equal(s.format('day'), 'Tuesday', 'tues')
})
test('add fortnight', () => {
  const s = spacetime()
  const a = s.clone().add(2, 'fortnight')
  const b = s.clone().add(4, 'weeks')
  assert.equal(a.iso(), b.iso(), 'fortnight')
})

test('test floats as inputs', () => {
  const num = 0.5
  let s = spacetime(null)
  s = s.date(num)
  s = s.hour(num)
  s = s.day(num)
  s = s.minute(num)
  s = s.year(num)
  s = s.second(num)
  s = s.add(num, 'hours')
  s = s.add(num, 'days')
  s = s.add(num, 'years')
  s = s.add(num, 'months')
  s = s.minus(num, 'quarter')
  assert.ok(!s.isEqual(spacetime.now()), 'float-input')
})

test('apostrophe year', () => {
  let s = spacetime().year("'97").startOf('year')
  assert.equal(s.format('iso-short'), '1997-01-01', "'97")

  s = spacetime().year("'13").startOf('year')
  assert.equal(s.format('iso-short'), '2013-01-01', "'13")

  s = spacetime({ year: `'22`, month: 'feb' }).startOf('month')
  assert.equal(s.format('iso-short'), '2022-02-01', 'apostrophe in object-input')
})

test('weird inputs', () => {
  const now = spacetime.now().add(1, 'millisecond')
  const isNull = spacetime(null)
  assert.ok(isNull.isSame(now, 'hour'), 'null input')
  const isUndefined = spacetime(undefined)
  assert.ok(isUndefined.isSame(now, 'hour'), 'Undefined input')
  const isFalse = spacetime(false)
  assert.ok(isFalse.isSame(now, 'hour'), 'isFalse input')
  const isObj = spacetime({})
  assert.ok(isObj.isSame(now, 'hour'), 'isObj input')
  const isArr = spacetime([])
  assert.ok(isArr.isSame(now, 'hour'), 'isArr input')
})

test('min < max', () => {
  const min = spacetime.min('Canada/Pacific')
  const max = spacetime.max('Canada/Eastern')
  assert.ok(min.isBefore(max), 'min < max')
})

test('subtract overflow', () => {
  const s = spacetime.now()
  const a = s.subtract(25, 'month');
  const b = s.subtract(13, 'month');
  assert.ok(a.iso() !== b.iso(), 'subtractions not equal')
})
