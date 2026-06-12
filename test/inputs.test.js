import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('inputs', () => {
  const a = spacetime([2015, 2, 25])
  const b = spacetime('25 Mar 2015')
  const c = spacetime('Mar 25 2015')
  const d = spacetime('03/25/2015')
  const e = spacetime('2015/03/25')
  const f = spacetime('2015-03-25')
  assert.ok(a.isValid(), 'date is valid')
  assert.ok(a.isSame(b, 'hour'), 'b-is-equal')
  assert.ok(a.isSame(c, 'hour'), 'c-is-equal')
  assert.ok(a.isSame(d, 'hour'), 'd-is-equal')
  assert.ok(a.isSame(e, 'hour'), 'e-is-equal')
  assert.ok(a.isSame(f, 'hour'), 'f-is-equal')
})

test('hour-inputs', () => {
  let s = spacetime('March 21, 2017 20:42:00')
  assert.equal(s.date(), 21, 'before-dst.date()')
  assert.ok(s.isValid(), 'hour input is valid')

  s = spacetime('March 11, 2017 20:42:00')
  assert.equal(s.date(), 11, 'after-dst.date()')
})

test('null input', () => {
  const a = spacetime(null, 'Canada/Eastern')
  const b = spacetime(Date.now(), 'Canada/Eastern')
  assert.ok(a.isValid(), 'null input is valid')
  assert.equal(a.format('iso-short'), b.format('iso-short'), 'dates are the same')
  assert.equal(a.format('time'), b.format('time'), 'times are the same')
})

test('undefined input', () => {
  const a = spacetime(undefined, 'Canada/Eastern')
  const b = spacetime(Date.now(), 'Canada/Eastern')
  assert.ok(a.isValid(), 'undefined input is valid')
  assert.equal(a.format('iso-short'), b.format('iso-short'), 'dates are the same')
  assert.equal(a.format('time'), b.format('time'), 'times are the same')
})

test('arr-input', () => {
  let s = spacetime([2020, 2, 28])
  assert.ok(s.isValid(), 'array input is valid')
  assert.equal(s.year(), 2020, 'arr-year')
  assert.equal(s.date(), 28, 'arr-date')
  assert.equal(s.monthName(), 'march', 'arr-month')

  s = s.set([2017, 1, 2])
  assert.equal(s.year(), 2017, 'set-arr-year')
  assert.equal(s.date(), 2, 'set-arr-date')
  assert.equal(s.month(), 1, 'set-arr-month')

  //on a dst change
  const d = spacetime([2019, 'march', 31, 3, 3], 'Europe/Stockholm')
  assert.equal(d.format('{month} {date} {time}'), 'March 31 3:03am', 'array sets time over dst-switch')
})

test('obj-input', () => {
  let s = spacetime({
    year: 2020,
    month: 'march',
    date: 28
  })
  assert.ok(s.isValid(), 'obj input is valid')
  assert.equal(s.date(), 28, 'obj-date')
  assert.equal(s.year(), 2020, 'obj-year')
  assert.equal(s.monthName(), 'march', 'obj-month')

  //ignore null and undefined values
  const a = spacetime({
    month: '12',
    day: '25',
    hour: '6',
    minute: '24',
    ampm: null
  })
  const b = spacetime({
    month: '12',
    day: '25',
    hour: '6',
    minute: '24'
  })
  assert.equal(a.format('nice'), b.format('nice'), 'ampm null')

  s = spacetime({ year: 1921 })
  assert.equal(s.format('nice-year'), 'Jan 1st, 1921', 'assume default date')
  s = spacetime({ year: 1921, month: 'feb' })
  assert.equal(s.format('nice-year'), 'Feb 1st, 1921', 'assume default date2')
  s = spacetime({ year: 1921, date: 3 })
  assert.equal(s.format('nice-year'), 'Jan 3rd, 1921', 'assume default date3')

  let today = { date: 17, month: 3, year: 1999 }
  let wantDate = { month: 'august', date: '1st', year: '2019' }
  s = spacetime(wantDate, null, { today: today })
  assert.equal(s.format('{month-short} {date-ordinal} {year}'), 'Aug 1st 2019', 'want object with today object');

})

test('date-input', () => {
  const d = new Date('March 11, 2017')
  const s = spacetime(d)
  assert.ok(s.isValid(), 'date object input is valid')
  // assert.equal(s.date(), 11, 'date-date');//FIXME:!
  assert.equal(s.year(), 2017, 'date-year')
  assert.equal(s.monthName(), 'march', 'date-month')
})

test('self-input', () => {
  const a = spacetime('March 11, 2017')
  const s = spacetime(a)
  assert.ok(s.isValid(), 'spacetime object input is valid')
  assert.equal(s.date(), 11, 'self-date')
  assert.equal(s.year(), 2017, 'self-year')
  assert.equal(s.monthName(), 'march', 'self-month')
})

test('inputs-in-comparisons', () => {
  const s = spacetime('March 11, 2017')
  assert.ok(s.isAfter(new Date('March 10, 2017')), 'compare with date obj')
  // assert.ok(s.isBefore([2022, 3, 2]), 'compare with array'); //this isn't working yet
  const future = spacetime([2022, 3, 2])
  assert.ok(s.isBefore(future.epoch), 'compare with epoch')
  assert.ok(s.isBefore(future), 'compare with spacetimeObj')
})

test('iso-string-input', () => {
  const s = spacetime('2017-08-06T09:00:00.000Z')
  assert.ok(s.isValid(), 'obj input is valid')
  assert.equal(s.millisecond(), 0, 'iso-string-millisecond')
  assert.equal(s.second(), 0, 'iso-string-second')
  assert.equal(s.minute(), 0, 'iso-string-minute')
  assert.equal(s.hour(), 9, 'iso-string-hour')
  assert.equal(s.date(), 6, 'iso-string-date')
  assert.equal(s.month(), 7, 'iso-string-month')
  assert.equal(s.year(), 2017, 'iso-string-year')
})

test('overlong-milliseconds-iso-string-input', () => {
  const s = spacetime('2017-08-06T09:00:00.12345Z')
  assert.ok(s.isValid(), 'overlong obj input is valid')
  assert.equal(s.millisecond(), 123, 'overlong-iso-string-millisecond')
  assert.equal(s.second(), 0, 'overlong-iso-string-second')
  assert.equal(s.minute(), 0, 'overlong-iso-string-minute')
  assert.equal(s.hour(), 9, 'overlong-iso-string-hour')
  assert.equal(s.date(), 6, 'overlong-iso-string-date')
  assert.equal(s.month(), 7, 'overlong-iso-string-month')
  assert.equal(s.year(), 2017, 'overlong-iso-string-year')
})

test('iso format with space', () => {
  const a = spacetime('2018-02-02T22:00:00')
  const b = spacetime('2018-02-02 22:00:00')
  assert.ok(a.isSame(b, 'minute'), 'support space-iso')
})

test('iso format lowercase', () => {
  const a = spacetime('2020-03-02t01:03:10.000z')
  const b = spacetime('2020-03-02T01:03:10.000Z')
  assert.ok(a.isSame(b, 'minute'), 'lowercase-iso')
})

test('funny-numeric-forms', () => {
  const a = spacetime('2016/03/13')

  let b = spacetime('03/13/2016')
  assert.equal(a.format('numeric'), b.format('numeric'), 'mm/dd/yyyy')

  b = spacetime('2016/13/03')
  assert.equal(a.format('numeric'), b.format('numeric'), 'yyyy/dd/mm')

  b = spacetime('13/03/2016')
  assert.equal(a.format('numeric'), b.format('numeric'), 'dd/mm/yyyy')

  b = spacetime('13-mar-2016')
  assert.equal(a.format('numeric'), b.format('numeric'), 'dd/month/yyyy')
})

test('empty-array', () => {
  const s = spacetime([])
  assert.ok(s.isValid(), 'array input is valid')
  assert.ok(s.monthName(), 'january', 'empty array is january 1st')
  assert.ok(s.date(), 1, 'empty array is january 1st')
  assert.ok(s.year(), new Date().getFullYear(), 'empty array is start of current year')
})

test('empty-object', () => {
  const s = spacetime({})
  assert.ok(s.isValid(), 'obj input is valid')
  assert.ok(s.monthName(), 'january', 'empty obj is january 1st')
  assert.ok(s.date(), 1, 'empty obj is january 1st')
  assert.ok(s.year(), new Date().getFullYear(), 'empty obj is start of current year')
})

test('invalid inputs', () => {
  assert.equal(spacetime('2012-07-32').isValid(), false, 'day 32')
  assert.equal(spacetime('2012-07-22').isValid(), true, 'day 22')

  assert.equal(spacetime('2018-02-31').isValid(), false, 'february-days #1')
  assert.equal(spacetime('2018-02-30').isValid(), false, 'february-days #2')
  assert.equal(spacetime('2018-02-29').isValid(), false, 'non-leap year 2018')
  assert.equal(spacetime('2017-02-29').isValid(), false, 'non-leap year 2017')
  assert.equal(spacetime('2016-02-29').isValid(), true, 'leap year 2016')
  assert.equal(spacetime('2015-02-29').isValid(), false, 'non-leap year 2015')
  assert.equal(spacetime('2014-02-29').isValid(), false, 'non-leap year 2014')

  assert.equal(spacetime('2018/02/30').isValid(), false, 'february-days format #2')
  assert.equal(spacetime('2017-04-32T08:00:00-0700').isValid(), false, 'iso format #1')
  assert.equal(spacetime('2017-02-29T08:00:00-0700').isValid(), false, 'iso format #2')
  assert.equal(spacetime('2016-02-29T08:00:00-0700').isValid(), true, 'iso format #3')

  assert.equal(spacetime('02/28/2015').isValid(), true, 'british format #1')
  assert.equal(spacetime('02/29/2015').isValid(), false, 'british format #2')
  assert.equal(spacetime('02/29/2016').isValid(), true, 'british format #3')

  assert.equal(spacetime('Feb 29 2001').isValid(), false, 'long format #1')
  assert.equal(spacetime('Feb 29 2000').isValid(), true, 'long format #2')
  assert.equal(spacetime('Feb 29 2003').isValid(), false, 'long format #3')

  assert.equal(spacetime('29th Feb 2001').isValid(), false, 'long format #4')
  assert.equal(spacetime('29th Feb 2000').isValid(), true, 'long format #5')
  assert.equal(spacetime('29th February 2003').isValid(), false, 'long format #6')

  const s = spacetime('-2 February 2003', 'UTC', {
    silent: true
  })
  assert.equal(s.isValid(), false, 'negative numbers invalid too')
})

test('time-inputs', () => {
  let s = spacetime('July 27 2018')
  assert.equal(s.format('nice'), 'Jul 27th, 12:00am', 'no-time')

  //time-easier
  s = spacetime('Tuesday August 1st, 3:30am')
  assert.equal(s.format('nice'), 'Aug 1st, 3:30am', '3:30am')

  s = spacetime('Tuesday August 1st, 3:30pm')
  assert.equal(s.format('nice'), 'Aug 1st, 3:30pm', '3:30pm')

  s = spacetime('Tuesday August 1st, 2pm')
  assert.equal(s.format('nice'), 'Aug 1st, 2:00pm', '2pm')

  s = spacetime('Tuesday August 1st, 9am')
  assert.equal(s.format('nice'), 'Aug 1st, 9:00am', '9am')

  //time-weirder
  s = spacetime('Tuesday August 1st, 12:00am')
  assert.equal(s.format('nice'), 'Aug 1st, 12:00am', '12:00am')

  s = spacetime('August 1, 2017 00:01:05')
  assert.equal(s.format('nice'), 'Aug 1st, 12:01am', '12:01am')

  //invalid minutes
  s = spacetime('June 5 2019, 5:5')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-minute1')

  s = spacetime('June 5 2019, 5:90')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-minute2')

  s = spacetime('June 5 2019, 5:82pm')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-minute2')

  //invalid hours
  s = spacetime('June 5 2019, 13pm')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-hour1')

  s = spacetime('June 5 2019, 28am')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-hour2')

  s = spacetime('June 5 2019, 200am')
  assert.equal(s.format('nice'), 'Jun 5th, 12:00am', 'invalid-hour3')

})

test('implicit-years', () => {
  const year = new Date().getFullYear()
  assert.equal(
    spacetime('sunday April 3rd').format('numeric'),
    spacetime('April 3rd ' + year).format('numeric'),
    'apr 3'
  )
  assert.equal(
    spacetime('3rd June').format('numeric'),
    spacetime('3rd June ' + year).format('numeric'),
    '3rd june'
  )
  assert.equal(
    spacetime('03/28').format('numeric'),
    spacetime('03/28/' + year).format('numeric'),
    '03/28'
  )
})

test('inplicit-date', () => {
  assert.equal(spacetime('dec 1919').format('iso-short'), '1919-12-01')
  assert.equal(spacetime('november 2030').format('iso-short'), '2030-11-01')
  assert.equal(spacetime('thursday november 2030').format('iso-short'), '2030-11-01')
  assert.equal(spacetime('thurs november 2030').format('iso-short'), '2030-11-01')
  assert.equal(spacetime('wed november 2030').format('iso-short'), '2030-11-01')
  assert.equal(spacetime('sep 2019').format('iso-short'), '2019-09-01')
  assert.equal(spacetime('sept 2019').format('iso-short'), '2019-09-01')
})

test('british-input', () => {
  let s = spacetime('03/02/2017', null)
  assert.equal(s.format('iso-short'), '2017-03-02', 'default mm/dd/yyyy')

  s = spacetime('03/02/2017', null, { dmy: true })
  assert.equal(s.format('iso-short'), '2017-02-03', 'force dd/mm/yyyy')
})

test('short-format', () => {
  const a = spacetime('22-aug')
  const b = spacetime('aug-22')
  assert.equal(a.format('iso-short'), b.format('iso-short'), '22-aug')
})

test('time with seconds', () => {
  let s = spacetime('aug 22 2020', 'shanghai')
  s = s.time('1:02:12 PM')
  assert.equal(s.iso(), '2020-08-22T13:02:12.000+08:00', '1:02:12 PM')
  s = s.time('10:02:12 AM')
  assert.equal(s.iso(), '2020-08-22T10:02:12.000+08:00', '10:02:12 AM')
})

test('period-seperated', () => {
  const s = spacetime('2015.08.13')
  assert.equal(s.format(), '2015-08-13', 'period-parsed')

  const a = spacetime('09.13.2013')
  const b = spacetime('13.09.2013')
  assert.equal(a.format(), b.format(), 'dmy dot format')
})

test('iso-truncated', () => {
  const s = spacetime('2012-07')
  assert.equal(s.format(), '2012-07-01', 'iso-truncated')
})

test('month-idioms', () => {
  let d = spacetime('december 3rd')
  d = d.month('sept')
  assert.equal(d.format('{month}'), 'September', 'sept')

  d = spacetime('december 3rd')
  d = d.month('sep')
  assert.equal(d.format('{month}'), 'September', 'sep')

})
