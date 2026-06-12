import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('titlecase', () => {
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
  arr.forEach(tz => {
    const s = spacetime.now(tz)
    assert.equal(s.timezone().name, tz, tz)
  })
})
