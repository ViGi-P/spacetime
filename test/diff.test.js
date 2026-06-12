import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

const numbers = [1, 2, 5, 7, 15, 30, 40, 100, 110]
const units = ['day', 'week', 'month', 'quarter', 'year']

test('simple-diff', () => {
  let a = spacetime('March 26, 1999 20:42:00', 'Canada/Eastern')
  let b = spacetime('March 28, 1999 20:42:00', 'Canada/Eastern')
  assert.equal(a.diff(b, 'day'), 2, '2-days')
  a = spacetime('March 28, 1999 20:42:00', 'Canada/Eastern')
  b = spacetime('March 26, 1999 20:42:00', 'Canada/Eastern')
  assert.equal(a.diff(b, 'day'), -2, '-2-days')
})

test('all-diff', () => {
  const a = spacetime('March 28, 1999 20:42:00', 'Canada/Eastern')
  units.forEach((unit) => {
    numbers.forEach((num) => {
      const b = a.clone().add(num, unit)
      assert.equal(a.diff(b, unit), num, num + '-' + unit)
    })
  })
})

test('diff-small', () => {
  const a = spacetime('July 27 2018')
  const b = a.clone().minus(20, 'seconds')
  const obj = b.diff(a)
  assert.equal(obj.milliseconds, 20000, 'small-ms')
  assert.equal(obj.seconds, 20, 'small-s')
  assert.equal(obj.hours, 0, 'small-hour')
  assert.equal(obj.days, 0, 'small-day')
  assert.equal(obj.weeks, 0, 'small-weeks')
  assert.equal(obj.months, 0, 'small-months')
  assert.equal(obj.years, 0, 'small-years')
})

test('diff-big', () => {
  const a = spacetime('July 27 2018')
  const b = a.clone().minus(20, 'years')
  const obj = b.diff(a)
  assert.equal(obj.milliseconds, 631152000000, 'big-ms')
  assert.equal(obj.seconds, 631152000, 'big-s')
  assert.equal(obj.hours, 175320, 'big-hour')
  assert.equal(obj.days, 7305, 'big-day')
  // assert.equal(obj.weeks, 1044, 'big-weeks') //some side-effect of making 'add' dst awareness
  assert.equal(obj.months, 240, 'big-months')
  assert.equal(obj.years, 20, 'big-years')
})

test('diff-awkward', () => {
  let start = spacetime('Dec 25th 2019')
  let end = spacetime('Jan 5th 2020')
  assert.equal(start.diff(end, 'year'), 0, 'a few days is not a year')

  start = spacetime('April 11th 2019') //thursday
  end = spacetime('April 11th 2019') //tuesday
  assert.equal(start.diff(end, 'week'), 0, 'a few days is not a week')

  start = spacetime('Dec 25th 2019')
  end = spacetime('Jan 5th 2020')
  assert.equal(start.diff(end, 'month'), 0, 'a few days is not a month')

  start = spacetime('Dec 25th 2019 5pm')
  end = spacetime('Dec 26th 2019 9am')
  assert.equal(start.diff(end, 'day'), 0, 'a few hours is not a day')

})

test('year-diff-short', () => {
  // only 10 months apart
  const start = spacetime('Dec 25th 2019')
  const end = start.add(10, 'months')

  const months = start.diff(end, 'months')
  assert.equal(months, 10, '10 months')

  let year = start.diff(end, 'year')
  assert.equal(year, 0, '10 months is not a year')

  year = start.diff(end).years
  assert.equal(year, 0, '10 months is (still) not a year')
})

test('year-diff-enough', () => {
  // fully >13 months apart
  const start = spacetime('Feb 25th 2019')
  const end = start.add(13, 'months')

  const months = start.diff(end, 'months')
  assert.equal(months, 13, '13 months')

  let year = start.diff(end, 'year')
  assert.equal(year, 1, '13 months is one year')

  year = start.diff(end).years
  assert.equal(year, 1, '13 months is (still) one year')
})

test('quick-diff-45-months', () => {
  const start = spacetime('Feb 25th 2019')
  const end = start.add(45, 'months')

  const obj = start.diff(end)
  assert.equal(obj.months, 45, '45-months')

  Object.keys(obj).forEach((k) => {
    const val = start.diff(end, k)
    assert.equal(obj[k], val, 'diff #1 -' + k)
  })
})

test('quick-diff-18-weeks', () => {
  const start = spacetime('June 25th 2019')
  const end = start.minus(18, 'weeks')

  const obj = start.diff(end)
  assert.equal(obj.weeks, -18, '18-weeks')
  Object.keys(obj).forEach((k) => {
    const val = start.diff(end, k)
    assert.equal(obj[k], val, 'diff #2 -' + k)
  })
})

test('quick-diff-13-minutes', () => {
  const start = spacetime('Feb 25th 2019')
  const end = start.add(13, 'minutes')

  const obj = start.diff(end)
  Object.keys(obj).forEach((k) => {
    const val = start.diff(end, k)
    assert.equal(obj[k], val, 'diff #3 -' + k)
  })
})

test('diff-timezone same time', () => {
  const east = spacetime('oct 1st 2020 11:00am', 'Canada/Eastern')
  const west = spacetime('oct 1st 2020 8:00am', 'Canada/Pacific')
  const diff = east.since(west).diff
  assert.equal(diff.days, 0, 'same-day')
  assert.equal(diff.hours, 0, 'same-hour')
  assert.equal(diff.minutes, 0, 'same-min')
  assert.equal(diff.seconds, 0, 'same-sec')
})

test('diff-timezone almost same time', () => {
  const east = spacetime('oct 1st 2020 10:00am', 'Canada/Eastern')
  const west = spacetime('oct 1st 2020 8:00am', 'Canada/Pacific')
  const diff = east.since(west).diff
  assert.equal(diff.days, 0, 'same-day')
  assert.equal(diff.hours, -1, 'almost same-hour')
  assert.equal(diff.minutes, 0, 'same-min')
  assert.equal(diff.seconds, 0, 'same-sec')
})

test('diff-timezone equal times', () => {
  const east = spacetime('oct 1st 2020 8:00am', 'Canada/Eastern')
  const west = spacetime('oct 1st 2020 8:00am', 'Canada/Pacific')
  const diff = east.since(west).diff
  assert.equal(diff.days, 0, 'same-day')
  assert.equal(diff.hours, -3, 'hour diff')
  assert.equal(diff.minutes, 0, 'same-min')
  assert.equal(diff.seconds, 0, 'same-sec')
})

test('i18n', () => {
  const start = spacetime('Dec 25th 2021')
  const end = spacetime('Feb 2nd 2022')

  const translationValues = {
    units: {
      secondWord: 'segundo',
      secondWordPlural: 'segundos',
      minuteWord: 'minuto',
      minuteWordPlural: 'minutos',
      hourWord: 'hora',
      hourWordPlural: 'horas',
      dayWord: 'dia',
      dayWordPlural: 'dias',
      monthWord: 'mes',
      monthWordPlural: 'meses',
      yearWord: 'año',
      yearWordPlural: 'años'
    }
  }

  start.i18n(translationValues)
  end.i18n(translationValues)

  const diff = start.since(end).diff
  assert.equal(diff.days, -8, 'same-day')
  assert.equal(diff.hours, 0, 'hour diff')
  assert.equal(diff.minutes, 0, 'same-min')
  assert.equal(diff.seconds, 0, 'same-sec')
})
