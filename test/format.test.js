import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('to-from utc-format', () => {
  const arr = [
    '1998-05-01T08:00:00.000Z',
    '1998-05-30T22:00:00.000Z',
    '2017-01-01T08:00:00.000Z',
    '2017-01-30T22:00:00.000Z',
    '2016-02-02T08:00:00.000Z',
    '2016-02-02T09:00:00.100Z',
    '2016-11-02T08:01:22.023Z',
    '2016-11-04T09:00:59.122Z',
    '2015-01-02T20:01:22.023Z',
    '2016-03-28T09:01:00.999Z',
    '2019-04-01T12:15:00.000+03:00',
    '2019-04-01T12:15:00.000+04:00',
    '2019-04-01T12:15:00.000+05:00',
    '2019-04-01T12:15:00.000+05:30',
    '2019-03-13T18:00:00.000-05:30',
    '2019-03-13T18:00:00.000-00:30',
    '2011-01-01T18:00:00.000+00:30',
    '1992-03-21T18:00:00.000+11:30',
    '1990-03-22T06:20:30.020+11:30',
    '1990-03-22T06:20:30.020+11:00',
    '1962-03-22T11:11:30.120-11:00',
    '0986-05-01T09:58:23.078-04:00',
    '0098-05-04T23:16:19.444Z',
    '-000098-05-04T23:16:19.444Z',
    '-000986-05-01T09:58:23.078-04:00',
    '-002345-05-04T23:12:01.970Z'
  ]
  arr.forEach((str) => {
    const s = spacetime(str)
    const out = s.format('iso')
    assert.equal(str, out, 'equal - ' + str)
  })

  const str = '2016-01-01T09:00:00.122Z'
  const s = spacetime(str, 'Canada/Eastern')
  assert.equal(s.format('iso'), str, 'input matches output')

})

test('unix-formatting', () => {
  const epoch = 1510850065194
  let s = spacetime(epoch, 'Canada/Eastern')
  //examples from http://unicode.org/reports/tr35/tr35-25.html#Date_Format_Patterns
  let arr = [
    ['h:mm a', '11:34 AM'],
    ['LLL', 'Nov'],
    [`yyyy.MM.dd G 'at' HH:mm:ss zzz`, '2017.11.16 AD at 11:34:25 Canada/Eastern'],
    [`EEE, MMM d, ''yy`, "Thu, Nov 16, '17"],
    [`hh 'o''clock' a`, '11 oclock AM'],
    ['yyyyy.MMMM.dd GGG hh:mm aaa', '02017.November.16 AD 11:34 AM'],
    ['yyyy-MM-ddTHH:mm:ssZ', '2017-11-16T11:34:25-0500'],
    ['yyyy-MM-ddTHH:mm:ssZZ', '2017-11-16T11:34:25-0500'],
    ['yyyy-MM-ddTHH:mm:ssZZZ', '2017-11-16T11:34:25-0500'],
    ['yyyy-MM-ddTHH:mm:ssZZZZ', '2017-11-16T11:34:25-05:00'],
    // support spaces
    ["HH'h'", '11h'],
    ["HH 'h'", '11 h']
  ]
  arr.forEach((a) => {
    assert.equal(s.unixFmt(a[0]), a[1], a[0])
  })

  //test another date
  s = spacetime([2018, 'February', 20], 'Canada/Eastern')
  arr = [
    ['M', '2'],
    ['MM', '02'],
    ['MMM', 'Feb'],
    ['MMMM', 'February']
  ]
  arr.forEach((a) => {
    assert.equal(s.unixFmt(a[0]), a[1], a[0])
  })
})

test('bc-year-formatting', () => {
  let s = spacetime('2,000 BC')
  assert.equal(s.format('year'), '2000 BC', '2000bc')
  assert.equal(s.year(), -2000, '-2000')

  s = spacetime('July 27th, 2018')
  s = s.minus(2020, 'years')
  assert.equal(s.year(), -2, '-2')
  assert.equal(s.format('year'), '2 BC', '2bc')
  assert.equal(s.monthName(), 'july', 'still july')
  assert.equal(s.date(), 27, 'still july 27')
  assert.equal(s.format('iso-short'), '-0002-07-27', '-0002-07-27')

})

test('iso-in = iso-out', () => {
  let str = '2018-07-09T12:59:00.362-07:00'
  const minus = spacetime(str)
  assert.equal(minus.format('iso'), str, 'minus-seven')

  str = '2018-07-09T12:59:00.000+07:00'
  const plus = spacetime(str)
  assert.equal(plus.format('iso'), str, 'plus-seven')

  str = '2018-07-09T12:59:00.393Z'
  const zero = spacetime(str)
  assert.equal(zero.format('iso'), str, 'zulu')

})

test('iso-with-fraction-offset', () => {
  const s = spacetime('June 8th 1918', 'Asia/Calcutta').time('1:00pm')
  assert.equal(s.format('iso'), '1918-06-08T13:00:00.000+05:30', 'correct offset')
})

test('hour-pad', () => {
  let s = spacetime('June 8th 1918', 'Asia/Calcutta').time('1:23pm')
  assert.equal(s.format('{hour-pad}:{minute-pad}'), '01:23', 'hour-pad')
  assert.equal(s.format('{hour-24-pad}:{minute-pad}'), '13:23', '24-hour-pad')
  s = s.ampm('am')
  assert.equal(s.format('{hour-pad}:{minute-pad}'), '01:23', 'am-hour-pad')
  assert.equal(s.format('{hour-24-pad}:{minute-pad}'), '01:23', 'am-24-hour-pad')
})

test('made-up-syntax', () => {
  let s = spacetime('June 8th 1918', 'Asia/Calcutta')
  s = s.time('4:45pm')
  const arr = [
    ['month', 'June'],
    ['{month}', 'June'],
    ['{month} {hour}:{minute}{ampm}', 'June 4:45pm'],
    ['{day} the {date-ordinal} of {month}', 'Saturday the 8th of June']
  ]
  arr.forEach((a) => {
    assert.equal(s.format(a[0]), a[1], a[0])
  })
})

test('test 0-based formatting', () => {
  const s = spacetime('January 4 2017').time('12:01am')
  const out = s.format('{month} {month-number} {month-pad} {month-iso} {hour-24}')
  assert.equal(out, 'January 0 00 01 0', '0-based and 1-based months')
})

test('offset formatting', () => {
  const date = spacetime(null, 'Asia/Kathmandu')
  assert.equal(date.format('offset'), '+05:45', '45min offset')
})

test('test millisecond', () => {
  const date = spacetime('1990-03-22T06:20:30.020+11:30')
  assert.equal(date.format('millisecond'), '20', 'Millisecond in format')
  assert.equal(date.format('millisecond-pad'), '020', 'Millisecond with pad in format')
  assert.equal(date.unixFmt('SSS'), '020', 'Millisecond with pad in unix')
})
/* FIXME failing test
test('unix-fmt-padding', t => {
  let d = spacetime({
    year: 2017,
    month: 'january',
    day: 26,
    hour: 4,
    minute: 2
  })
  let str = d.format("ww DDD MM d, hh:mm a")
  assert.equal('04 027 Jan 27, 04:02 AM', str, 'string is 0-padded')

  str = d.format("w D MM d, h:m a")
  assert.equal('4 27 Jan 27, 4:2 AM', str, 'string is not-0-padded')
});*/

test('unix-year-padding', t => {
  let s = spacetime('sep 1 2022')
  assert.equal(s.unixFmt('yy'), '22', 'non-zero-end')
  s = spacetime('sep 1 2000')
  assert.equal(s.unixFmt('yy'), '00', 'zero-end')
})

test('am-pm-variants', () => {
  let s = spacetime('January 1, 2023')
  s = s.time('4:45pm')
  const arr = [
    ['{hour}:{minute}{ampm}', '4:45pm'],
    ['{hour}:{minute}{AMPM}', '4:45PM'],
    ['{hour}:{minute}{AMPM }', '4:45PM'],
    ['{AMPM}', 'PM'],
  ]
  arr.forEach((a) => {
    assert.equal(s.format(a[0]), a[1], a[2], a[3])
  })
})

test('SQL ISO 9075', () => {
  let s = spacetime('January 1, 2023')
  s = s.time('4:45pm')
  assert.equal(s.format('sql'), '2023-01-01 16:45:00')

  const sql = '2021-11-20 01:01:02'
  assert.equal(spacetime(sql).format('sql'), sql, 'in-out-sql')
})

test('epochSeconds', () => {
  let s = spacetime("2025-01-01T00:00.000Z")
  assert.equal(s.epochSeconds(), 1735689600, 'jan-1-utc epochSeconds')
  // assert.equal(spacetime("foobar oh yeah").epochSeconds(), null, 'invalid epochSeconds')

  s = spacetime("April 5, 2025 12:43:50", 'Canada/Eastern')
  assert.equal(s.epochSeconds(), 1743871430, 'apr-5 epochSeconds')

  let a = spacetime.now().epochSeconds(1637362862);
  assert.equal(a.epochSeconds(), 1637362862, 'seconds 1637362862');

  let b = spacetime().epochSeconds(1743871430);
  assert.equal(b.epochSeconds(), 1743871430, 'seconds 1743871430');
  assert.ok(s.isEqual(b), 'equal to iso');

})

test('epoch inputs', () => {

  let mils = 1744200453000
  let secs = 1744200453

  let a = spacetime(mils)
  assert.equal(a.epochSeconds(), secs, 'mils->secs')
  assert.equal(a.epoch, mils, 'mils->mils')

  let b = spacetime.now().epochSeconds(secs)
  assert.equal(b.epochSeconds(), secs, 'secs->secs')
  assert.equal(b.epoch, mils, 'secs->mils')

})
