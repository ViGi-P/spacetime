import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('set day forward', () => {
  const days = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed']
  const d = spacetime('march 18 2021') //thursday
  days.forEach((day, i) => {
    const s = d.day(day, true)
    const want = d.add(i, 'days')
    assert.equal(s.format('iso-short'), want.format('iso-short'), day)
  })
})

test('set day backward', () => {
  const days = ['tue', 'mon', 'sun', 'sat', 'fri', 'thu', 'wed']
  const d = spacetime('march 23 2021') //tuesday
  days.forEach((day, i) => {
    const s = d.day(day, false)
    const want = d.minus(i, 'days')
    assert.equal(s.format('iso-short'), want.format('iso-short'), day)
  })
})
