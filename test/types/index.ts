import { test } from 'node:test'
import assert from '../lib/assert.js'
import { spacetime } from './spacetime-static'

test('typefile smoketest', () => {
  assert.ok(spacetime, 'import works')
  const d = spacetime('June 5th 2019')
  assert.equal(d.format('iso-short'), '2019-06-05', 'basic-smoketest')
})

// Add reference to the other files so they included in the test build
import './constructor.test'
import './types.test'
