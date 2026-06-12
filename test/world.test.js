import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'
import useOldTz from './lib/useOldTz.js'

const timezones = [
  'Africa/Accra',
  'Europe/Jersey',
  'Asia/Ujung_Pandang',
  'Africa/Kinshasa',
  'Africa/Asmera',
  'Africa/Brazzaville',
  'Africa/Casablanca',
  'Asia/Ulaanbaatar',
  'Atlantic/Faroe',
  'Australia/Eucla',
  'Australia/Hobart',
  'Australia/Melbourne',
  'Brazil/West',
  'Canada/Atlantic',
  'Canada/Central',
  'Etc/GMT-7',
  'Etc/GMT-4',
  'Etc/Greenwich',
  'Europe/Amsterdam',
  'Europe/Bucharest',
  'Europe/Brussels',
  'Europe/Kaliningrad',
  'Europe/Sofia',
  'Indian/Comoro',
  'Indian/Reunion',
  'Pacific/Fiji',
  'Pacific/Nauru',
  'Pacific/Tongatapu',
  'Asia/Magadan',
  'Pacific/Yap'
]

test('epochs dont move on goto', () => {
  const a = spacetime('January 13 2018', 'Pacific/Fiji')
  timezones.forEach((tz) => {
    let b = a.clone()
    b = b.goto(tz)
    assert.ok(a.isEqual(b), tz + ' stable epoch')
  })
})

test('is-always-input-date', () => {
  timezones.forEach((tz) => {
    const a = spacetime([2030, 3, 2], tz)
    assert.equal(a.monthName(), 'april', tz + ' is april')
    assert.equal(a.date(), 2, tz + ' 2nd')
    assert.equal(a.year(), 2030, tz + ' is 2030')

    const b = spacetime(new Date(), tz)
    assert.equal(b.timezone().name, tz, tz + ' is right tz')

    const c = spacetime('03/01/2015', tz)
    assert.equal(c.monthName(), 'march', tz + ' is march')
    assert.equal(c.date(), 1, tz + ' 1st')
    assert.equal(c.year(), 2015, tz + ' is 2015')

    const d = spacetime('January 7 2018', tz)
    assert.equal(d.monthName(), 'january', tz + ' is january')
    assert.equal(d.date(), 7, tz + ' 7th')
    assert.equal(d.year(), 2018, tz + ' is 2018')

    const e = spacetime('March 28, 1998', tz)
    assert.equal(e.monthName(), 'march', tz + ' is march')
    assert.equal(e.date(), 28, tz + ' 28th')
    assert.equal(e.year(), 1998, tz + ' is 1998')
  })
})

test('all-timezones-move', () => {
  timezones.forEach((tz) => {
    let d = spacetime('January 13 2018', tz)
    d = useOldTz(d)
    assert.equal(d.dayName(), 'saturday', tz + ' saturday')
    d = d.date(12)
    assert.equal(d.dayName(), 'friday', tz + ' friday')
    d = d.day('saturday')
    assert.equal(d.dayName(), 'saturday', tz + ' set-saturday')
    d = d.startOf('week')
    assert.equal(d.dayName(), 'monday', tz + ' monday')
    d = d.endOf('week')
    assert.equal(d.dayName(), 'sunday', tz + ' sunday')
  })
})

test('all-timezones-have-leap-years', () => {
  timezones.forEach((tz) => {
    let d = spacetime('February 28 2020', tz)
    d = d.time('11:30pm')
    d = d.add(1, 'hour')
    assert.equal(d.format('nice'), 'Feb 29th, 12:30am', 'leap year in ' + tz)
  })
})
