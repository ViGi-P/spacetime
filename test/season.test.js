import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

const south = [
  'Africa/Johannesburg',
  'Brazil/Acre',
  'Australia/Canberra',
  'Asia/Jakarta',
  'America/Argentina',
  'Africa/Lusaka'
]
const north = [
  'America/Detroit',
  'Mexico/BajaSur',
  'Canada/Eastern',
  'Europe/Oslo',
  'Asia/Baghdad',
  'Asia/Istanbul'
]

test('season-by-hemisphere', () => {
  //june
  let s = spacetime('june 6 2017', 'Canada/Eastern')
  south.forEach((tz) => {
    s = s.goto(tz)
    assert.equal(s.season(), 'winter', tz + ' june-winter')
  })
  north.forEach((tz) => {
    s = s.goto(tz)
    assert.equal(s.season(), 'summer', tz + ' june-summer')
  })
})

test('set season - north', () => {
  let s = spacetime('winter', 'Canada/Eastern')
  assert.equal(s.monthName(), 'december', 'winter .month()')
  assert.equal(s.date(), 1, 'q1 .date()')

  s = spacetime('spring', 'Canada/Eastern')
  assert.equal(s.monthName(), 'march', 'spring .month()')
  assert.equal(s.date(), 1, 'spring .date()')

  s = spacetime('summer', 'Canada/Eastern')
  assert.equal(s.monthName(), 'june', 'summer .month()')
  assert.equal(s.date(), 1, 'summer .date()')

  s = spacetime('fall', 'Canada/Eastern')
  assert.equal(s.monthName(), 'september', 'fall .month()')
  assert.equal(s.date(), 1, 'fall .date()')

  s = spacetime('fall 2001', 'Canada/Eastern')
  assert.equal(s.monthName(), 'september', 'fall year .month()')
  assert.equal(s.date(), 1, 'fall year .date()')
  assert.equal(s.year(), 2001, 'fall .year()')

  s = spacetime('fall of 1960', 'Canada/Eastern')
  assert.equal(s.monthName(), 'september', 'fall of year .month()')
  assert.equal(s.date(), 1, 'fall of year .date()')
  assert.equal(s.year(), 1960, 'fall of .year()')

})

test('season - south', () => {
  let s = spacetime('nov 11 2022', 'australia/adelaide')
  assert.equal(s.season(), 'spring', 'south-spring')
  s = s.add(4, 'weeks')
  assert.equal(s.season(), 'summer', 'south-summer')
})
