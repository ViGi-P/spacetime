import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('swapTz', () => {
  const arr = [
    'Africa/Dar_es_Salaam',
    'Africa/Porto-Novo',
    'America/Blanc-Sablon',
    'America/Port-au-Prince',
    'America/Port_of_Spain',
    'Europe/Isle_of_Man',
    'Antarctica/DumontDUrville',
    'Antarctica/McMurdo',
    'Asia/Ust-Nera',
    'Europe/Zagreb',
    'America/Bahia_Banderas',
    'Asia/Kuching',
    'Etc/GMT+7',
  ]
  let s = spacetime('2011-12-03T10:15:30', 'america/montreal')
  assert.equal(s.time(), '10:15am', 'first-time')
  arr.forEach(tz => {
    s = s.timezone(tz)
    assert.equal(s.timezone().name, tz, 'swapped tz ', tz)
    assert.equal(s.time(), '10:15am', 'swap time ' + tz)
  })
})
