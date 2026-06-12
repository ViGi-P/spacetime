import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('set quarter', () => {
  let s = spacetime('q1', 'Canada/Eastern')
  assert.equal(s.monthName(), 'january', 'q1 .month()')
  assert.equal(s.date(), 1, 'q1 .date()')

  s = spacetime('q2')
  assert.equal(s.monthName(), 'april', 'q2 .month()')
  assert.equal(s.date(), 1, 'q2 .date()')

  s = spacetime('q3')
  assert.equal(s.monthName(), 'july', 'q3 .month()')
  assert.equal(s.date(), 1, 'q2 .date()')

  s = spacetime('q4')
  assert.equal(s.monthName(), 'october', 'q4 .month()')
  assert.equal(s.date(), 1, 'q4 .date()')

  s = spacetime('q1 2001')
  assert.equal(s.monthName(), 'january', 'q1 year .month()')
  assert.equal(s.date(), 1, 'q1 year .date()')
  assert.equal(s.year(), 2001, 'q1 .year()')

  s = spacetime('q1 of 1962')
  assert.equal(s.monthName(), 'january', 'q1 year of .month()')
  assert.equal(s.date(), 1, 'q1 year of .date()')
  assert.equal(s.year(), 1962, 'q1 of .year()')

})

test('startOf quarter', () => {
  const start = '2020-01-01'
  const d = spacetime(start).startOf('day')
  const arr = [
    [2, 'days'],
    [23, 'days'],
    [52, 'days'],
    [12, 'hours'],
    [112, 'hours'],
    [92, 'hours'],
    [(192, 'hours')],
    [2, 'weeks'],
    [9, 'weeks'],
    [2, 'minutes'],
    [4, 'hours']
  ]
  arr.forEach((a) => {
    let s = d.add(a[0], a[1])
    s = s.startOf('quarter')
    assert.equal(s.format(), start, a.join(' '))
  })
})

test('startOf/endOf quarter', () => {
  let d = spacetime('2018-10-01')
  d = d.endOf('quarter')
  assert.equal(d.format(), '2018-12-31', 'endOf quarter')

  d = spacetime('2018-11-01')
  d = d.endOf('quarter')
  assert.equal(d.format(), '2018-12-31', 'endOf quarter from mid')

  d = spacetime('2018-12-11')
  d = d.endOf('quarter')
  assert.equal(d.format(), '2018-12-31', 'endOf quarter from end')
  d = d.endOf('quarter')
  assert.equal(d.format(), '2018-12-31', 'endOf quarter repeat')
})

test('add/minus mid-quarter', () => {
  let d = spacetime('2017-03-01', 'Canada/Eastern')
  d = d.add(1, 'quarter')
  assert.equal(d.format(), '2017-06-01', 'add quarter over dst change')
})

test('add/minus quarter', () => {
  let d = spacetime('2018-10-01')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  assert.equal(d.format(), '2019-10-01', 'add 4 quarters')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  assert.equal(d.format(), '2018-10-01', 'minus 4 quarters')

  d = spacetime('2020-01-01')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  d = d.add(1, 'quarter')
  assert.equal(d.format(), '2021-01-01', 'add 4 quarters leap')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  d = d.minus(1, 'quarter')
  assert.equal(d.format(), '2020-01-01', 'minus 4 quarters leap')
})

test('long-move quarters', () => {
  let d = spacetime('2019-01-01')
  d = d.minus(8, 'quarter')
  assert.equal(d.format(), '2017-01-01', 'minus 8 quarters')

  d = spacetime('2019-01-01')
  d = d.plus(8, 'quarter')
  assert.equal(d.format(), '2021-01-01', 'plus 8 quarters')

  d = spacetime('2019-03-11')
  d = d.plus(13, 'quarter') //3 years and 1 quarter
  assert.equal(d.format(), '2022-06-11', 'plus 13 quarters')

  d = spacetime('2012-11-03')
  d = d.minus(13, 'quarter') //3 years and 1 quarter
  assert.equal(d.format(), '2009-08-03', 'minus 13 quarters')

  d = spacetime('2010-01-11')
  d = d.plus(4 * 8, 'quarter') //8 years
  assert.equal(d.format(), '2018-01-11', 'plus 8 years')

  d = spacetime('2013-02-02')
  d = d.minus(4 * 13, 'quarter') //13 years
  assert.equal(d.format(), '2000-02-02', 'minus 13 years')

})
