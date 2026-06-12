import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('implicit goto', () => {
  const a = spacetime('March 14, 2017 22:48:00', 'Africa/Algiers')
  const b = spacetime('March 14, 2017 22:48:00', 'Canada/Pacific')

  assert.equal(a.format('iso-short'), b.format('iso-short'), 'dates are the same')
  assert.equal(a.format('time-h12'), b.format('time-h12'), 'times are the same')
})

test('goto-from-est', () => {
  let s = spacetime('February 22, 2017 15:42:00', 'Canada/Eastern')
  assert.equal(s.date(), 22, 'est-date')
  assert.equal(s.monthName(), 'february', 'est-month')
  assert.equal(s.year(), 2017, 'est-year')
  assert.equal(s.hour(), 15, 'est-hour')
  assert.equal(s.minute(), 42, 'est-minute')

  //three hours back
  s = s.goto('Canada/Pacific')
  assert.equal(s.date(), 22, 'pst-date')
  assert.equal(s.month(), 1, 'pst-month')
  assert.equal(s.year(), 2017, 'pst-year')
  assert.equal(s.hour(), 12, 'pst-hour-moved')
  assert.equal(s.minute(), 42, 'pst-minute')

  //return to est
  s = s.goto('Canada/Eastern')
  assert.equal(s.date(), 22, 'est2-date')
  assert.equal(s.month(), 1, 'est2-month')
  assert.equal(s.year(), 2017, 'est2-year')
  assert.equal(s.hour(), 15, 'est2-hour-returned')
  assert.equal(s.minute(), 42, 'est2-minute')
})

test('goto-from-algiers (no-dst-places)', () => {
  //march 14th in algiers (+60)
  let s = spacetime('March 14, 2017 22:48:00', 'Africa/Algiers')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 10:48pm', 'init-date')
  //this shouldn't change things
  s = s.goto('Africa/Algiers')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 10:48pm', 'unchanged-date')
  //same offset!
  s = s.goto('Africa/Brazzaville')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 10:48pm', 'same-offset')
  //one to the left...
  s = s.goto('Africa/Dakar')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 9:48pm', 'one-hour-left')
  //one to the right...
  s = s.goto('Africa/Bujumbura')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 11:48pm', 'one-hour-right')
  //two to the right...
  s = s.goto('Asia/Baghdad')
  assert.equal(s.format('nice-full'), 'Wednesday March 15th, 12:48am', 'two-hours-right-(tomorrow)')
  //three to the right
  s = s.goto('Asia/Dubai')
  assert.equal(s.format('nice-full'), 'Wednesday March 15th, 1:48am', 'three-hours-right-(tomorrow)')
  //three and a half to the right...
  s = s.goto('Asia/Kabul')
  assert.equal(
    s.format('nice-full'),
    'Wednesday March 15th, 2:18am',
    'three-and-a-half-to-the-right-(tomorrow)'
  )
  //back to yesterday..
  s = s.goto('Africa/Dakar')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 9:48pm', 'back-to-one-hour-left')
  //back to original
  s = s.goto('Africa/Algiers')
  assert.equal(s.format('nice-full'), 'Tuesday March 14th, 10:48pm', 'back-to-init-date')

})

test('move-from-dst', () => {
  //dst in Paris (+2h)
  let s = spacetime('April 2, 2019 22:48:00', 'Europe/Paris')
  assert.equal(s.format('nice-full'), 'Tuesday April 2nd, 10:48pm', 'init-paris')
  assert.equal(s.timezone().current.isDST, true, 'paris-is-in-dst')
  assert.equal(s.timezone().current.offset, 2, 'paris-is-+2h')

  //in Johannesburg (+2h)
  s = s.goto('Africa/Johannesburg')
  assert.equal(s.format('nice-full'), 'Tuesday April 2nd, 10:48pm', 'init-joburg')
  assert.equal(s.timezone().current.isDST, false, 'joburg-is-never-in-dst')
  assert.equal(s.timezone().current.offset, 2, 'joburg-is+2')

  //dst London (+1h)
  s = s.goto('Europe/London')
  assert.equal(s.format('nice-full'), 'Tuesday April 2nd, 9:48pm', 'init-london')
  assert.equal(s.timezone().current.isDST, true, 'london-is-in-dst')
  assert.equal(s.timezone().current.offset, 1, 'london-is-+1h')
})

test('move-from-not-dst', () => {
  //not-dst in Paris (+1h)
  let s = spacetime('March 17, 2017 22:48:00', 'Europe/Paris')
  assert.equal(s.format('nice-full'), 'Friday March 17th, 10:48pm', 'init-paris')
  assert.equal(s.timezone().current.isDST, false, 'paris-is-not-in-dst')
  assert.equal(s.timezone().current.offset, 1, 'paris-is-+1h')

  //in Johannesburg (+2h)
  s = s.goto('Africa/Johannesburg')
  assert.equal(s.format('nice-full'), 'Friday March 17th, 11:48pm', 'move-to-joburg')
  assert.equal(s.timezone().current.isDST, false, 'joburg-is-never-in-dst')
  assert.equal(s.timezone().current.offset, 2, 'joburg-is+2')

  //not-dst London (+0h)
  s = s.goto('Europe/London')
  assert.equal(s.format('nice-full'), 'Friday March 17th, 9:48pm', 'init-london')
  assert.equal(s.timezone().current.isDST, false, 'london-is-not-in-dst')
  assert.equal(s.timezone().current.offset, 0, 'london-is-+0h')
})

test('move-to-dst', () => {
  //move from never-dst (uruguay) to a dst (moncton)
  let s = spacetime('August 1, 2017 00:01:05', 'America/Montevideo')
  assert.equal(s.format('nice-full'), 'Tuesday August 1st, 12:01am', 'init-uruguay')
  assert.equal(s.timezone().current.isDST, false, 'uruguay-is-never-dst')
  assert.equal(s.timezone().current.offset, -3, 'uruguay-is-always -3hrs')
  s = s.goto('America/Moncton')
  assert.equal(s.format('nice-full'), 'Tuesday August 1st, 12:01am', 'init-Moncton')
  assert.equal(s.timezone().current.isDST, true, 'Moncton-is-dst')
  assert.equal(s.timezone().current.offset, -3, 'Moncton-is -3hrs')
})

test('move-to-not-dst', () => {
  //now move from never-dst (uruguay) to a not-dst (moncton)
  let s = spacetime('January 1, 2017 00:01:05', 'America/Montevideo')
  assert.equal(s.format('nice-full'), 'Sunday January 1st, 12:01am', 'init-uruguay')
  assert.equal(s.timezone().current.isDST, false, 'uruguay-is-never-dst')
  assert.equal(s.timezone().current.offset, -3, 'uruguay-is-always -3hrs')
  s = s.goto('America/Moncton')
  assert.equal(s.format('nice-full'), 'Saturday December 31st, 11:01pm', 'init-Moncton')
  assert.equal(s.timezone().current.isDST, false, 'Moncton-is-not-dst')
  assert.equal(s.timezone().current.offset, -4, 'Moncton-is -4hrs')
})

test('goto null returns to local tz', () => {
  const s = spacetime().time('4:30pm').goto('Europe/Paris').goto(null)
  assert.equal(s.time(), '4:30pm', 'goto-null')
})
