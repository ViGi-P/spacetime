import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('since()', () => {
  const a = spacetime('November 11, 1999 11:11:11', 'Canada/Eastern')
  const b = spacetime('December 12, 2000 12:12:12', 'Canada/Eastern')

  assert.deepEqual(
    b.since(a),
    {
      diff: {
        years: 1,
        months: 1,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1
      },
      rounded: '1 year ago',
      qualified: '1 year ago',
      precise: '1 year, 1 month ago',
      abbreviated: ['1y', '1m', '1d', '1h', '1m', '1s'],
      iso: 'P1Y1M1DT1H1M1S',
      direction: 'past'
    },
    'simple-ago'
  )

  assert.deepEqual(
    a.since(b),
    {
      diff: {
        years: -1,
        months: -1,
        days: -1,
        hours: -1,
        minutes: -1,
        seconds: -1
      },
      rounded: 'in 1 year',
      qualified: 'in 1 year',
      precise: 'in 1 year, 1 month',
      abbreviated: ['1y', '1m', '1d', '1h', '1m', '1s'],
      iso: 'P1Y1M1DT1H1M1S',
      direction: 'future'
    },
    'simple-in'
  )

  assert.deepEqual(
    a.since(a),
    {
      diff: {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      rounded: 'now',
      qualified: 'now',
      precise: 'now',
      abbreviated: [],
      iso: 'P0Y0M0DT0H0M0S',
      direction: 'present'
    },
    'same'
  )

  const almostTwoYears = a.clone().add(1, 'year').add(11, 'months')
  const overTwoMonths = a.clone().add(2, 'months').add(11, 'days')
  const yearAndASecond = a.clone().add(1, 'year').add(1, 'second')
  const twoSeconds = a.clone().add(2, 'seconds')

  assert.deepEqual(
    a.since(almostTwoYears),
    {
      diff: {
        years: -1,
        months: -11,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      rounded: 'in 2 years',
      qualified: 'in almost 2 years',
      precise: 'in 1 year, 11 months',
      abbreviated: ['1y', '11m'],
      iso: 'P1Y11M0DT0H0M0S',
      direction: 'future',
    },
    'almost'
  )

  assert.deepEqual(
    a.since(overTwoMonths),
    {
      diff: {
        years: 0,
        months: -2,
        days: -11,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      rounded: 'in 2 months',
      qualified: 'in over 2 months',
      precise: 'in 2 months, 11 days',
      abbreviated: ['2m', '11d'],
      iso: 'P0Y2M11DT0H0M0S',
      direction: 'future'
    },
    'over'
  )

  assert.deepEqual(
    a.since(yearAndASecond),
    {
      diff: {
        years: -1,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: -1
      },
      rounded: 'in 1 year',
      qualified: 'in 1 year',
      precise: 'in 1 year, 1 second',
      abbreviated: ['1y', '1s'],
      iso: 'P1Y0M0DT0H0M1S',
      direction: 'future'
    },
    'precise'
  )

  assert.deepEqual(
    a.since(twoSeconds),
    {
      diff: {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: -2
      },
      rounded: 'in 2 seconds',
      qualified: 'in 2 seconds',
      precise: 'in 2 seconds',
      abbreviated: ['2s'],
      iso: 'P0Y0M0DT0H0M2S',
      direction: 'future'
    },
    'seconds'
  )

})

test('since now - default', () => {
  const past = spacetime.now().subtract(23, 'months').subtract(23, 'seconds')
  const since = past.since()
  assert.equal(since.diff.years, -1, '1 year back')
  assert.equal(since.diff.months, -11, '11 months back')
  assert.equal(since.diff.seconds, -23, '23 seconds back')
  assert.equal(since.precise, 'in 1 year, 11 months', 'precise is good')
  assert.deepEqual(since.abbreviated, ['1y', '11m', '23s'], 'abbreviated is good')
})

test('supports soft inputs', () => {
  const now = spacetime([2019, 3, 12])
  const c = spacetime('dec 25 2018')
  let obj = now.since(c).diff
  assert.equal(obj.months, 3, 'christmas was 3 months ago')

  obj = spacetime('christmas').diff('new years')
  assert.equal(obj.days, 6, '6 days between christmas and new years')

  obj = spacetime('April 12th 2018').since('April 10th 2018')
  assert.equal(obj.rounded, '2 days ago', 'rounded')
  assert.equal(obj.qualified, '2 days ago', 'qualified')
  assert.equal(obj.precise, '2 days ago', 'precise')
  let diff = obj.diff
  assert.equal(diff.years, 0, '0 years')
  assert.equal(diff.months, 0, '0 months')
  assert.equal(diff.days, 2, '2 days')
  assert.equal(diff.hours, 0, '0 hours')
  assert.equal(diff.seconds, 0, '0 seconds')
  assert.deepEqual(obj.abbreviated, ['2d'], 'abbreviated')

  //opposite since logic
  obj = spacetime('April 8th 2018').since('April 10th 2018')
  assert.equal(obj.rounded, 'in 2 days', 'rounded')
  assert.equal(obj.qualified, 'in 2 days', 'qualified')
  assert.equal(obj.precise, 'in 2 days', 'precise')
  diff = obj.diff
  assert.equal(diff.years, 0, '0 years')
  assert.equal(diff.months, 0, '0 months')
  assert.equal(diff.days, -2, '2 days')
  assert.equal(diff.hours, 0, '0 hours')
  assert.equal(diff.seconds, 0, '0 seconds')
  assert.deepEqual(obj.abbreviated, ['2d'], 'abbreviated')

})

test('from + fromNow aliases', () => {
  const obj = spacetime('April 12th 2008', 'Canada/Pacific').from('March 12 2018')
  assert.equal(obj.qualified, 'almost 10 years ago', 'qualified')
  assert.equal(obj.precise, '9 years, 11 months ago', 'precise')
})

test('since calculation involves month addition and subtraction', () => {
  let prev = spacetime('2019-01-31T23:00:50.0Z')
  let now = spacetime('2019-02-01T10:00:00.0Z')
  assert.deepEqual(now.since(prev), {
    diff: {
      years: 0,
      months: 0,
      days: 0,
      hours: 10,
      minutes: 59,
      seconds: 10
    },
    rounded: '11 hours ago',
    qualified: 'almost 11 hours ago',
    precise: '10 hours, 59 minutes ago',
    abbreviated: ['10h', '59m', '10s'],
    iso: 'P0Y0M0DT10H59M10S',
    direction: 'past'
  })

  prev = spacetime('2019-08-31T12:00:00.0Z')
  now = spacetime('2019-09-01T11:00:00.0Z')

  assert.deepEqual(now.since(prev), {
    diff: {
      years: 0,
      months: 0,
      days: 0,
      hours: 23,
      minutes: 0,
      seconds: 0
    },
    rounded: '23 hours ago',
    qualified: '23 hours ago',
    precise: '23 hours ago',
    abbreviated: ['23h'],
    iso: 'P0Y0M0DT23H0M0S',
    direction: 'past'
  })

})

test('i18n, past and future', () => {
    const start = spacetime("Dec 25th 2021");
    const end = start
        .add(1, 'minute')
        .add(2, 'seconds')
        .add(3, 'hours')
        .add(1, 'day');

    const translationValues = {
        distance: {
            past: 'pasado',
            future: 'futuro',
            present: 'presente',
            now: 'ahora',
            almost: 'casi',
            over: 'pasan',
            pastDistance: (value) => `hace ${value}`,
            futureDistance: (value) => `en ${value}`
        },
        units: {
            second: 'segundo',
            seconds: 'segundos',
            minute: 'minuto',
            minutes: 'minutos',
            hour: 'hora',
            hours: 'horas',
            day: 'dia',
            days: 'dias',
            month: 'mes',
            months: 'meses',
            year: 'año',
            years: 'años',
        },
    }

    start.i18n(translationValues);
    end.i18n(translationValues);


    assert.deepEqual(end.since(start), {
        diff: { days: 1, hours: 3, minutes: 1, months: 0, seconds: 2, years: 0 },
        precise: "hace 1 dia, 3 horas",
        qualified: "hace 1 dia",
        rounded: "hace 1 dia",
        abbreviated: ['1d', '3h', '1m', '2s'],
        iso: "P0Y0M1DT3H1M2S",
        direction: 'pasado'
    })

    assert.deepEqual(start.since(end), {
        diff: { days: -1, hours: -3, minutes: -1, months: 0, seconds: -2, years: 0 },
        precise: "en 1 dia, 3 horas",
        qualified: "en 1 dia",
        rounded: "en 1 dia",
        abbreviated: ['1d', '3h', '1m', '2s'],
        iso: "P0Y0M1DT3H1M2S",
        direction: 'futuro'
    })

})

test('i18n, almost and over', () => {
    const start = spacetime("Dec 25th 2021");
    const almost21Days = start
        .add(23, 'hours')
        .add(20, 'days')
    const almost1Hour = start
        .add(5, 'hours')
        .add(59, 'minutes')
    const overTwoMonths = start.clone().add(2, 'months').add(11, 'days')

    const translationValues = {
        distance: {
            past: 'pasado',
            future: 'futuro',
            present: 'presente',
            now: 'ahora',
            almost: 'casi',
            over: 'algo más de',
            pastDistance: (value) => `hace ${value}`,
            futureDistance: (value) => `en ${value}`
        },
        units: {
            second: 'segundo',
            seconds: 'segundos',
            minute: 'minuto',
            minutes: 'minutos',
            hour: 'hora',
            hours: 'horas',
            day: 'dia',
            days: 'dias',
            month: 'mes',
            months: 'meses',
            year: 'año',
            years: 'años',
        },
    }

    start.i18n(translationValues);
    almost21Days.i18n(translationValues)
    almost1Hour.i18n(translationValues)
    overTwoMonths.i18n(translationValues)

    assert.deepEqual(start.since(almost21Days).qualified, "en casi 21 dias")
    assert.deepEqual(almost1Hour.since(start).qualified, "hace casi 6 horas")
    assert.deepEqual(start.since(overTwoMonths).qualified, "en algo más de 2 meses" )

})

test('i18n, now', () => {
    const start = spacetime("Dec 25th 2021");
    const end = spacetime("Dec 25th 2021");

    const translationValues = {
        distance: {
            past: 'pasado',
            future: 'futuro',
            present: 'presente',
            now: 'ahora',
            almost: 'casi',
            over: 'pasan',
            pastDistance: (value) => `hace ${value}`,
            futureDistance: (value) => `en ${value}`
        },
        units: {
            second: 'segundo',
            seconds: 'segundos',
            minute: 'minuto',
            minutes: 'minutos',
            hour: 'hora',
            hours: 'horas',
            day: 'dia',
            days: 'dias',
            month: 'mes',
            months: 'meses',
            year: 'año',
            years: 'años',
        },
    }

    start.i18n(translationValues);
    end.i18n(translationValues)

    assert.deepEqual(start.since(end), {
        diff: {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        },
        rounded: 'ahora',
        qualified: 'ahora',
        precise: 'ahora',
        abbreviated: [],
        iso: 'P0Y0M0DT0H0M0S',
        direction: 'presente'
    })

})