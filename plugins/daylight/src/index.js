import sunCalc from 'suncalc'
import spacetimeGeo from 'spacetime-geo'
import sunPosition from './sunPosition.js'
import solstice from './solstices.js' //equinox

const setFrom = function (s, time) {
  const d = new Date(time)
  // console.log(time)
  s = s.clone()
  s.epoch = d.getTime()
  return s
}

const calculatePoint = function (s, lat, lng, field) {
  if (lat === undefined || lng === undefined) {
    const guess = s.point()
    lat = guess.lat
    lng = guess.lng
  }
  s.in = s.in || spacetimeGeo.in //bolt-on the plugin
  s = s.in(lat, lng)
  const d = new Date(s.epoch)
  const res = sunCalc.getTimes(d, lat, lng)
  return setFrom(s, res[field])
}

export default {
  //depend on this plugin
  in: spacetimeGeo.in,
  point: spacetimeGeo.point,

  solstice: function () {
    return solstice(this)
  },
  winterSolstice: function () {
    return solstice(this).winter
  },
  summerSolstice: function () {
    return solstice(this).summer
  },
  sunPosition: function (lat, lng) {
    return sunPosition(this, lat, lng)
  },
  sunrise: function (lat, lng) {
    return calculatePoint(this, lat, lng, 'sunrise')
  },
  sunset: function (lat, lng) {
    return calculatePoint(this, lat, lng, 'sunset')
  },
  noon: function (lat, lng) {
    return calculatePoint(this, lat, lng, 'solarNoon')
  },
  dawn: function (lat, lng) {
    return calculatePoint(this, lat, lng, 'dawn')
  },
  dusk: function (lat, lng) {
    return calculatePoint(this, lat, lng, 'dusk')
  },
  daylight: function (lat, lng) {
    const sunrise = this.sunrise(lat, lng)
    const sunset = this.sunset(lat, lng)
    const delta = sunset.since(sunrise)
    //clean this up a bit
    const duration = {
      hours: delta.diff.hours,
      minutes: delta.diff.minutes,
      seconds: delta.diff.seconds,
    }
    const diff = sunrise.diff(sunset)
    diff.seconds = parseInt((sunset.epoch - sunrise.epoch) / 1000, 10)

    const now = sunrise.diff(this)
    now.seconds = parseInt((this.epoch - sunrise.epoch) / 1000, 10)

    let progress = now.seconds / diff.seconds
    let status = 'day'
    const dawn = this.dawn()
    const dusk = this.dusk()
    if (progress < 0) {
      progress = 0
      if (this.epoch > dawn.epoch) {
        status = 'dawn'
      } else {
        status = 'night'
      }
    } else if (progress > 1) {
      progress = 0
      if (this.epoch < dusk.epoch) {
        status = 'dusk'
      } else {
        status = 'night'
      }
    }

    return {
      dawn: dawn.time(),
      sunrise: sunrise.time(),
      sunset: sunset.time(),
      dusk: dusk.time(),
      duration: {
        inHours: diff.hours,
        inMinutes: diff.minutes,
        inSeconds: diff.seconds,
        human: duration,
      },
      current: {
        progress: progress,
        status: status,
      },
    }
  },
}
