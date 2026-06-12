import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('get-decade', () => {
  let s = spacetime('Nov 2 2019', 'America/New_York')
  assert.equal(s.decade(), 2010, '2010')
  s = spacetime('jan 1 2020')
  assert.equal(s.decade(), 2020, '2020')

  s = spacetime('300BC', 'America/New_York')
  assert.equal(s.decade(), -300, '-300th century?')

  s = spacetime('2AD')
  assert.equal(s.decade(), 0, '0th decade')

})

test('set-decade', () => {
  let s = spacetime.now().year(2019)
  s.decade(1950)
  assert.equal(s.year(), 2019, 'decade doesnt mutate')

  s = s.decade('1950')
  assert.equal(s.year(), 1950, '1950 decade')
  s = s.decade('1950 AD')
  assert.equal(s.year(), 1950, '1950 AD')
  s = s.decade('1860s')
  assert.equal(s.year(), 1860, '1860s decade')
  s = s.decade(1954)
  assert.equal(s.year(), 1950, 'round-down decade')
  s = s.decade('60s')
  assert.equal(s.year(), 1960, '60s decade')
  // s = s.decade(50)
  // assert.equal(s.year(), 50, '50 decade')
  // s = s.decade(0)
  // assert.equal(s.year(), 1, '0th decade')
  s = s.decade(-50)
  assert.equal(s.year(), -50, '-50 decade')
  s = s.decade(-1950)
  assert.equal(s.year(), -1950, '-1950 decade')
  s = s.decade('1950bc')
  assert.equal(s.year(), -1950, '1950bc decade')
  s = s.decade(-1954)
  assert.equal(s.year(), -1960, '-round down negative')

})

test('get-century', () => {
  let s = spacetime('Nov 2 2019', 'America/New_York')
  assert.equal(s.century(), 21, '21st century')

  s = spacetime('1892', 'America/New_York')
  assert.equal(s.century(), 19, '19th century')

  s = spacetime('300BC', 'America/New_York')
  assert.equal(s.century(), -4, '4rth century bc')

  s = spacetime('2AD', 'America/Chicago')
  assert.equal(s.century(), 1, '1st century?')

})
test('set-century', () => {
  let s = spacetime('Nov 2 2019', 'America/New_York')
  s.century('2nd')
  assert.equal(s.year(), 2019, 'doesnt mutate')

  s = s.century('21st')
  assert.equal(s.year(), 2000, '21st century')
  s = s.century(20)
  assert.equal(s.year(), 1900, '20 century')
  s = s.century('19th c')
  assert.equal(s.year(), 1800, '19th c')
  s = s.century('17c')
  assert.equal(s.year(), 1600, '17c')

  // s = s.century('1')
  // assert.equal(s.year(), 1, '1 century')
  // s = s.century('-100')
  // assert.equal(s.year(), 100, '1 century bc')
  s = s.century(-20)
  assert.equal(s.year(), -1900, '20 century bc is -1990')

})

test('get-millennium', () => {
  let s = spacetime('Nov 2 2019', 'America/New_York')
  assert.equal(s.millennium(), 3, '3rd millennium')
  s = spacetime('Nov 2 1219', 'America/New_York')
  assert.equal(s.millennium(), 2, '2nd millennium')
  s = spacetime('83AD', 'America/New_York')
  assert.equal(s.millennium(), 1, '1st millennium')
  s = spacetime('83BC', 'America/New_York')
  assert.equal(s.millennium(), -1, '-1 millennium')
  s = spacetime('1218BC', 'America/New_York')
  assert.equal(s.millennium(), -2, '-2 millennium')
  s = spacetime('2018BC', 'America/New_York')
  assert.equal(s.millennium(), -3, '-3 millennium')
})

test('set-millennium', () => {
  let s = spacetime.now().year(2019)
  s.millennium('2nd')
  assert.equal(s.year(), 2019, 'millennium doesnt mutate')

  s = s.millennium('3rd')
  assert.equal(s.year(), 2000, 'millennium year 2000')
  s = s.millennium('2')
  assert.equal(s.year(), 1000, 'millennium year 1000')

  s = s.millennium('1st')
  assert.equal(s.year(), 1, 'millennium year 1')
  s = s.millennium(1)
  assert.equal(s.year(), 1, 'millennium year 1')
})
