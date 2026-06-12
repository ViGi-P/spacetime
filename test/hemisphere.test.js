import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

const june = 1401660600207 //june 1, 6:10pm
const jan = 1515368004641 //january 7th, 6:30pm

test('toronto/Santiago same in june', () => {
  const a = spacetime(june, 'America/Toronto')
  assert.equal(-4, a.timezone().current.offset, 'toronto -4')
  assert.equal(true, a.timezone().current.isDST, 'toronto in dst')
  assert.equal('North', a.hemisphere(), 'toronto in north')

  const b = spacetime(june, 'America/Santiago')
  assert.equal(-4, b.timezone().current.offset, 'santiago -4')
  assert.equal(false, b.timezone().current.isDST, 'santiago not dst')
  assert.equal('South', b.hemisphere(), 'santiago in south')

  assert.ok(a.format('nice'), b.format('nice'), 'same-calendar-time1')
})

test('toronto/Santiago -2hrs in january', () => {
  const a = spacetime(jan, 'America/Toronto')
  assert.equal(-5, a.timezone().current.offset, 'toronto -5')
  assert.equal(false, a.timezone().current.isDST, 'toronto not dst')
  assert.equal('North', a.hemisphere(), 'toronto in north')

  const b = spacetime(jan, 'America/Santiago')
  assert.equal(-3, b.timezone().current.offset, 'santiago -3')
  assert.equal(true, b.timezone().current.isDST, 'santiago is dst')
  assert.equal('South', b.hemisphere(), 'santiago in south')
  assert.notEqual(a.format('nice'), b.format('nice'), 'not same-calendar-time')
})

test('northern-hemisphere spring-ahead', () => {
  //regina is always -6, mexico city goes -5 in the summer (dst+1)
  //so both are -6 in january
  const jan1 = spacetime('January 21, 2017 20:42:00', 'America/menominee')
  const jan2 = jan1.clone().goto('America/Regina')
  assert.equal(jan1.format('nice'), jan2.format('nice'), 'same-calendar-time2')
  assert.equal(false, jan1.isDST(), 'Mexico_City-not-dst-in-january')
  assert.equal(false, jan2.isDST(), 'Regina-never-dst')

  //not the same in september
  const sep1 = spacetime('September 21, 2017 20:42:00', 'America/menominee')
  const sep2 = jan1.clone().goto('America/Regina')
  assert.notEqual(sep1.format('nice'), sep2.format('nice'), 'not-same-calendar-time-anymore')
  assert.equal(true, sep1.isDST(), 'Mexico_City-is-dst-in-sep')
  assert.equal(false, sep2.isDST(), 'Regina-never-dst2')
})

test('southern-hemisphere spring-back', () => {
  //so both are -3 in january
  const jan1 = spacetime('January 21, 2017 20:42:00', 'America/Santiago')
  const jan2 = jan1.clone().goto('America/Cordoba')
  assert.equal(jan1.epoch, jan2.epoch, 'same-time')
  assert.equal(true, jan1.isDST(), 'Santiago-in-dst-in-january')
  assert.equal(false, jan2.isDST(), 'argentina-never-dst')

  //but then, in may, santiago is -4 and argentina is still -3
  const jul1 = spacetime('May 21, 2017 20:42:00', 'America/Santiago')
  const jul2 = jul1.clone().goto('America/Cordoba')
  assert.equal(20, jul1.hour(), 'not-same-time')
  assert.equal(21, jul2.hour(), 'not-same-time')
  assert.equal(false, jul1.isDST(), 'Santiago-not-dst-in-july')
  assert.equal(false, jul2.isDST(), 'argentina-never-dst2')
})
