import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

const right = [
  'Europe/Zurich', //+1
  'Europe/Athens', //+2
  'Europe/Volgograd', //3
  'Indian/Reunion', //4
  'Etc/GMT-5', //5
  'Asia/Dhaka', //6
  'Asia/Phnom_Penh', //7
  'Australia/West', //8
  'Asia/Tokyo', //9
  'Pacific/Saipan', //10
  'Pacific/Kosrae', //11
  'Pacific/Fiji' //12
]
// 'Europe/London', //0
const left = [
  'Atlantic/Cape_Verde', //-1
  'Brazil/DeNoronha', //-2
  'America/Araguaina', //-3
  'America/Campo_Grande', //-4
  'America/Havana', //-5
  'America/Guatemala', //-6
  'America/Dawson_Creek', //-7
  'Pacific/Pitcairn', //-8
  'Etc/GMT+9', //-9
  'America/Adak', //-10
  'Pacific/Pago_Pago', //-11
  'Etc/GMT+12' //-12
]

test('test-date-line-at-180deg', () => {
  let s = spacetime([2018, 2, 5, 0, 0, 0, 0], 'Europe/London')
  s = s.startOf('day')
  assert.equal(s.time(), '12:00am', 'the first millisecond of the day')
  assert.equal(s.timezone().current.offset, 0, 'start at 0 offset')
  //everything to the right is today
  right.forEach((timezone) => {
    let d = s.clone()
    d = d.goto(timezone)
    assert.equal(d.date(), 5, timezone + ' is today')
  })
  //everything to the left is yesterday
  left.forEach((timezone) => {
    let d = s.clone()
    d = d.goto(timezone)
    assert.equal(d.date(), 4, timezone + ' is yesterday')
  })
})

test('test-date-line-at-0deg', () => {
  let s = spacetime([2018, 2, 5, 0, 0, 0, 0], 'Europe/London')
  s = s.endOf('day')
  assert.equal(s.time(), '11:59pm', 'the last millisecond of the day')
  assert.equal(s.timezone().current.offset, 0, 'start at 0 offset')
  //everything to the right is tomorrow
  right.forEach((timezone) => {
    let d = s.clone()
    d = d.goto(timezone)
    assert.equal(d.date(), 6, timezone + ' is tomorrow')
  })
  //everything to the left is today
  left.forEach((timezone) => {
    let d = s.clone()
    d = d.goto(timezone)
    assert.equal(d.date(), 5, timezone + ' is today')
  })
})

test('never cross the intl dateline moving right', () => {
  for (let h = 0; h < 24; h++) {
    //h ocklock on right side of the map
    const rightSide = spacetime([2022, 8, 24, h, 1], 'Pacific/Fiji')
    const time = h + ':01'
    assert.equal(rightSide.format('time-24'), time, 'time is ' + time)
    assert.equal(rightSide.date(), 24, 'date is 24th')
    //try move across dateline (to left side of the map)
    const leftSide = rightSide.clone().goto('Pacific/Midway')
    assert.ok(leftSide.epoch === rightSide.epoch, 'we never actually moved')
    //but...
    if (leftSide.date() === rightSide.date()) {
      assert.ok(leftSide.hour() < rightSide.hour(), '.. but hour moved backward')
    } else {
      assert.ok(leftSide.date() + 1 === rightSide.date(), '..but date moved backward')
      assert.ok(leftSide.hour() > rightSide.hour(), '..and hour moved < 24')
    }
  }
})

test('never cross the intl dateline moving left', () => {
  for (let h = 0; h < 24; h++) {
    //h ocklock on right side of the map
    const rightSide = spacetime([2022, 8, 24, h, 1], 'Pacific/Midway')
    const time = h + ':01'
    assert.equal(rightSide.format('time-24'), time, 'time is ' + time)
    assert.equal(rightSide.date(), 24, 'date is 24th')
    //try move across dateline (to left side of the map)
    const leftSide = rightSide.clone().goto('Pacific/Fiji')
    assert.ok(leftSide.epoch === rightSide.epoch, 'we never actually moved')
    //but...
    if (leftSide.date() === rightSide.date()) {
      assert.ok(leftSide.hour() > rightSide.hour(), '.. but hour moved forward')
    } else {
      assert.ok(leftSide.date() - 1 === rightSide.date(), '..but date moved forward')
      assert.ok(leftSide.hour() <= rightSide.hour(), '..and hour moved < 24')
    }
  }
})
