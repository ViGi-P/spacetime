import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('every-unit', () => {
  const start = spacetime('April 6th 2019', 'Europe/Paris')
  const end = spacetime('April 20th 2019', 'Europe/Paris').add(1, 'hour')

  const days = start.every('day', end)
  assert.equal(days.length, 15, '15 days')
  assert.equal(days[0].timezone().name, 'Europe/Paris', 'results in right timezone')

  const weeks = start.every(' weEK ', end)
  assert.equal(weeks.length, 2, '2 weeks')

  const years = start.every('years', end)
  assert.equal(years.length, 0, '0 years')

})

test('step-count', () => {
  const start = spacetime('April 6th 2019', 'Europe/Paris')
  const end = spacetime('April 20th 2019', 'Europe/Paris').add(3, 'years')

  const biannualInterval = start.every('quarter', end, 2)
  assert.equal(biannualInterval.length, 6, 'every 2 quarters')
  assert.equal(biannualInterval[0].timezone().name, 'Europe/Paris', 'results in right timezone')

  const fortnights = start.every('week', end, 2)
  assert.equal(fortnights.length, 80, 'every fortnight')
  assert.equal(biannualInterval[0].timezone().name, 'Europe/Paris', 'results in right timezone')

  const everyFourYears = start.every('years', end, 4)
  assert.equal(everyFourYears.length, 0, 'interval/step count too large for range')

})

test('monday-sunday', () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const start = spacetime('April 8th 2019').startOf('week')
  const end = start.endOf('week')
  const eachDay = start.every('day', end).map((d) => d.dayName())
  assert.deepEqual(eachDay, days, 'got mon-sunday')
})

test('long-every is stable', () => {
  const d = spacetime('jan 1st 1872')
  d.every('year', 'jan 1st 1902').forEach((s) => {
    const year = s.year()
    assert.equal(s.month(), 0, year + ' is-january')
    assert.equal(s.date(), 1, year + ' is-first')
  })
})
