import { test } from 'node:test'
import assert from './lib/assert.js'
import spacetime from './lib/index.js'

const defaultSettings = {
  days: {
    short: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    long: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  },
  months: {
    short: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
    long: [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ]
  },
  useTitleCase: true,
  ampm: {
    am: 'am',
    pm: 'pm'
  },
  distance: {
    pastWord: 'past',
    futureWord: 'future',
    presentWord: 'present',
    now: 'now',
    pastDistance: (value) => `${value} ago`,
    futureDistance: (value) => `in ${value}`
  }
}

test('i18n useTitleCase is false', () => {
  const a = spacetime([2000, 0, 1])

  assert.equal(a.format('day-short'), 'Sat', 'en: day-short')
  assert.equal(a.format('day'), 'Saturday', 'en: day')
  assert.equal(a.format('month-short'), 'Jan', 'en: month-short')
  assert.equal(a.format('month'), 'January', 'en: month')

  a.i18n({
    days: {
      short: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      long: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    },
    months: {
      short: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      long: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre'
      ]
    },
    useTitleCase: false
  })

  assert.equal(a.format('day-short'), 'sáb', 'es: day-short lowercase')
  assert.equal(a.format('day'), 'sábado', 'es: day lowercase')
  assert.equal(a.format('month-short'), 'ene', 'es: month-short lowercase')
  assert.equal(a.format('month'), 'enero', 'es: month lowercase')

  //reset them, for the other tests
  a.i18n(defaultSettings)

})

test('i18n', () => {
  const a = spacetime([2000, 0, 1])

  assert.equal(a.format('day-short'), 'Sat', 'en: day-short')
  assert.equal(a.format('day'), 'Saturday', 'en: day')
  assert.equal(a.format('month-short'), 'Jan', 'en: month-short')
  assert.equal(a.format('month'), 'January', 'en: month')

  a.i18n({
    days: {
      short: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      long: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    },
    months: {
      short: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      long: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre'
      ]
    },
      ampm: {
        am: ' a. m.',
        pm: ' p. m.'
    }
  })

  assert.equal(a.format('day-short'), 'Sáb', 'es: day-short')
  assert.equal(a.format('day'), 'Sábado', 'es: day')
  assert.equal(a.format('month-short'), 'Ene', 'es: month-short')
  assert.equal(a.format('month'), 'Enero', 'es: month')

  assert.equal(a.format('time'), '12:00 a. m.', 'es: am')

  //reset them, for the other tests
  a.i18n(defaultSettings)

})
