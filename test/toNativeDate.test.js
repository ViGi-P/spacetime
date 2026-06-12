import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('toNativeDate-is-epoch', () => {
  let d = spacetime(1554092400000, 'Australia/Brisbane') // 4:20, april 1st 2019 GMT
  d = d.hour('3').minute('14')

  const localDate = d.toNativeDate()
  const localDateSeconds = localDate.getTime()

  assert.equal(localDateSeconds, d.epoch, 'toNativeDate is not epoch')
})
