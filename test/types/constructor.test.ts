import { test } from 'node:test'
import assert from '../lib/assert.js'
import { spacetime } from './spacetime-static'
import { ParsableDate } from '../../types/types'

test('static api exists', () => {
  assert.equal(typeof spacetime, 'function', 'default is a function')
  assert.equal(typeof spacetime.now, 'function', '.now() is a function')
  assert.equal(typeof spacetime.today, 'function', '.today() is a function')
  assert.equal(typeof spacetime.tomorrow, 'function', '.tomorrow is a function')
  assert.equal(typeof spacetime.fromUnixSeconds, 'function', '.fromUnixSeconds is a function')
  assert.equal(typeof spacetime.yesterday, 'function', '.yesterday is a function')
  assert.equal(typeof spacetime.extend, 'function', '.extend is a function')
})

test('constructor args work', () => {
  assert.equal(spacetime(90071992547409919007199254740991).isValid(), false, 'doesnt accept garbage')
  assert.equal(spacetime(new Date('03/04/2017')).isValid(), true, 'accepts Date object')
  assert.equal(spacetime(1488610800000).isValid(), true, 'accepts epoch')
  assert.equal(spacetime([2017, 4, 3]).isValid(), true, 'accepts array')
  assert.equal(
    spacetime({ year: '2017', month: 4, day: 3 }).isValid(),
    true,
    'accepts unit descriptor object'
  )
  assert.equal(spacetime('2017-04-03').isValid(), true, 'accepts iso string')
  assert.equal(spacetime(<ParsableDate>'2017-04-03').isValid(), true, 'accepts datelike object')

  assert.equal(spacetime('2017-04-03', 'America/Vancouver').isValid(), true, 'accepts timezone argument')

  assert.equal(
    spacetime('2017-04-03', undefined, { silent: false }).isValid(),
    true,
    'accepts silent option'
  )
  assert.equal(
    spacetime('2017-04-03', undefined, { weekStart: 0 }).isValid(),
    true,
    'accepts weekStart option'
  )

})

test('methods have the correct type', () => {
  assert.equal(typeof spacetime().set, 'function', 'set is a function')
  assert.equal(typeof spacetime().timezone, 'function', 'timezone is a function')
  assert.equal(typeof spacetime().isDST, 'function', 'inDST is a function')
  assert.equal(typeof spacetime().hasDST, 'function', 'hasDST is a function')
  assert.equal(typeof spacetime().offset, 'function', 'offset is a function')
  assert.equal(typeof spacetime().hemisphere, 'function', 'hemisphere is a function')
  assert.equal(typeof spacetime().format, 'function', 'format is a function')
  assert.equal(typeof spacetime().unixFmt, 'function', 'unixFmt is a function')
  assert.equal(typeof spacetime().startOf, 'function', 'startOf is a function')
  assert.equal(typeof spacetime().endOf, 'function', 'endOf is a function')
  assert.equal(typeof spacetime().leapYear, 'function', 'leapYear is a function')
  assert.equal(typeof spacetime().progress, 'function', 'progress is a function')
  assert.equal(typeof spacetime().nearest, 'function', 'nearest is a function')
  assert.equal(typeof spacetime().diff, 'function', 'diff is a function')
  assert.equal(typeof spacetime().since, 'function', 'since is a function')
  assert.equal(typeof spacetime().next, 'function', 'next is a function')
  assert.equal(typeof spacetime().last, 'function', 'last is a function')
  assert.equal(typeof spacetime().isValid, 'function', 'isValid is a function')
  assert.equal(typeof spacetime().goto, 'function', 'hasDST is a function')
  assert.equal(typeof spacetime().every, 'function', 'goto is a function')
  assert.equal(typeof spacetime().isAwake, 'function', 'isAwake is a function')
  assert.equal(typeof spacetime().isAsleep, 'function', 'isAsleep is a function')
  assert.equal(typeof spacetime().log, 'function', 'log is a function')
  assert.equal(typeof spacetime().logYear, 'function', 'logYear is a function')
  assert.equal(typeof spacetime().json, 'function', 'json is a function')
  assert.equal(typeof spacetime().from, 'function', 'from is a function')
  assert.equal(typeof spacetime().fromNow, 'function', 'fromNow is a function')
  assert.equal(typeof spacetime().weekStart, 'function', 'weekStart is a function')
  assert.equal(typeof spacetime().inDST, 'function', 'inDST is a function')
  assert.equal(typeof spacetime().round, 'function', 'round is a function')
  assert.equal(typeof spacetime().each, 'function', 'each is a function')

})
