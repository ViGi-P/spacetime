import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

test('parse iso-full', () => {
  const full = '2011-12-03T10:15:30.010+01:00[Europe/Paris]'
  const s = spacetime(full)
  assert.equal(s.format('iso'), '2011-12-03T10:15:30.010+01:00', 'same-iso')
  assert.equal(s.format('iana'), 'Europe/Paris', 'got-tz')
  assert.equal(full, s.format('iso-full'), 'full-iso:' + full)
})

test('parse iso-full with different timezone', () => {
  const full = '2020-06-15T08:30:00.000-04:00[America/New_York]'
  const s = spacetime(full)
  assert.equal(s.format('iso'), '2020-06-15T08:30:00.000-04:00', 'same-iso')
  assert.equal(s.format('iana'), 'America/New_York', 'got-tz')
  assert.equal(full, s.format('iso-full'), 'full-iso:' + full)
})

test('parse iso-full with UTC timezone', () => {
  const full = '1999-12-31T23:59:59.000Z[UTC]'
  const s = spacetime(full)
  assert.equal(s.format('iso'), '1999-12-31T23:59:59.000Z', 'same-iso')
  assert.equal(s.format('iana'), 'UTC', 'got-tz')
  assert.equal(full, s.format('iso-full'), 'full-iso:' + full)
})

test('parse iso-full with positive offset', () => {
  const full = '2023-01-01T12:00:00.000+05:30[Asia/Kolkata]'
  const s = spacetime(full)
  assert.equal(s.format('iso'), '2023-01-01T12:00:00.000+05:30', 'same-iso')
  assert.equal(s.format('iana'), 'Asia/Kolkata', 'got-tz')
  assert.equal(full, s.format('iso-full'), 'full-iso:' + full)
})

test('parse iso-full with negative offset', () => {
  const full = '2023-01-01T12:00:00.000-07:00[America/Denver]'
  const s = spacetime(full)
  assert.equal(s.format('iso'), '2023-01-01T12:00:00.000-07:00', 'same-iso')
  assert.equal(s.format('iana'), 'America/Denver', 'got-tz')
  assert.equal(full, s.format('iso-full'), 'full-iso:' + full)
  assert.equal(full, s.isoFull(), 'isoFull():' + full)
})

test('calendar info', () => {
  const full = '2011-12-03T10:15:30+09:00[Asia/Tokyo][u-ca=japanese]'
  const s = spacetime(full)
  assert.equal(s.format('iso-short'), '2011-12-03', 'still got iso')
  assert.equal(s.timezone().name, 'Asia/Tokyo', 'still got tz')
})
