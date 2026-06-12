import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('change start of week', () => {
  let s = spacetime('may 30 2019', 'Canada/Eastern')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'monday', 'monday is default')
  assert.equal(s.day(), 1, 'monday is 1')
  assert.equal(s.date(), 27, 'startof week went backwards')

  //ok, change it
  s = s.weekStart(0)
  s = s.startOf('week')
  assert.equal(s.dayName(), 'sunday', 'sunday is new')
  assert.equal(s.day(), 0, 'sunday is 0')
  assert.equal(s.date(), 26, 'sunday went backwards')

  //check if it survives a clone
  let b = s.clone()
  b = b.startOf('week')
  assert.equal(b.dayName(), 'sunday', 'still sunday')

  //test endof
  b = b.endOf('week')
  assert.equal(b.dayName(), 'saturday', 'saturday is endof week now')

  //a new spacetime object is uneffected
  let s2 = spacetime('may 30 2019', 'Canada/Eastern')
  s2 = s2.startOf('week')
  assert.equal(s2.dayName(), 'monday', 'monday is still the default')
})

test('named weekStart', () => {
  let s = spacetime('june 1 2019', 'Europe/Berlin')

  s = s.weekStart('thursday')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'thursday', 'starts thursday')

  s = s.weekStart('wednesday')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'wednesday', 'starts wednesday')

  s = s.weekStart('sat')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'saturday', 'starts saturday')

  s = s.weekStart(' FRi  ')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'friday', 'starts friday')

})

//ensure .weekstart plays-nice with i18n changes
test('i18n weekStart', () => {
  let s = spacetime('may 30 2019', 'Canada/Pacific')
  s.i18n({
    days: {
      long: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    }
  })
  s = s.startOf('week')
  assert.equal(s.dayName(), 'lunes', 'default is monday')

  s = s.weekStart('martes')
  s = s.startOf('week')
  assert.equal(s.dayName(), 'martes', 'week starts on martes')

  //set it back..
  s.i18n({
    days: {
      long: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }
  })
  assert.equal(s.dayName(), 'tuesday', 'i18n swap back')
})
