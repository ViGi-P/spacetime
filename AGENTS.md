# spacetime — LLM usage guide

> spacetime is a zero-dependency JavaScript library for working with dates across
> timezones. It does timezone math (DST, leap years, hemispheres) **without** the
> `Intl` API, and exposes a Moment-like, **immutable** API. This file is written
> for LLM coding agents. If you follow the rules below you will avoid the mistakes
> models most commonly make with this library.

- Package: `spacetime` (npm) — `npm install spacetime`
- Version this doc targets: 7.x
- License: Apache-2.0
- Source of truth for the API: the TypeScript types in `types/` (`types.d.ts`,
  `constructors.d.ts`, `constraints.d.ts`).

---

## The five rules that matter most

1. **spacetime is IMMUTABLE.** Every method that "changes" a date returns a *new*
   `Spacetime` object and leaves the original untouched. You must capture the
   return value. `s.add(1, 'day')` alone does nothing observable — write
   `s = s.add(1, 'day')`.

2. **Months are 0-based; dates (day-of-month) are 1-based.** `s.month()` returns
   `0` for January … `11` for December. `s.date()` returns `1`–`31`. This mirrors
   the JavaScript `Date` spec. Array input follows the same rule:
   `spacetime([2017, 5, 2])` is **June 2nd 2017**, not May.

3. **Epochs are in MILLISECONDS.** `spacetime(1489520157124)` is a millisecond
   epoch. If you only have seconds, use `spacetime.fromUnixSeconds(seconds)` or
   multiply by 1000. Passing a seconds-epoch silently lands you in January 1970.

4. **Timezone is the 2nd argument to (almost) everything.** Constructor and all
   static helpers take `(input, timezone?, options?)`. If you omit the timezone,
   the *local machine/browser* timezone is used. Use IANA names
   (`'America/New_York'`, `'Europe/Paris'`).

5. **Getters and setters are the same method name.** Calling with no argument
   *reads*; calling with an argument *returns a new object* with that value set.
   `s.hour()` → `14`; `s.hour(9)` → a new Spacetime at 9am. This dual signature
   exists for: `millisecond, second, minute, hour, hour12, date, month, year,
   day, dayName, dayOfYear, time, week, quarter, season, hourFloat, ampm,
   dayTime, monthName, decade, century, millennium, epochSeconds, json, iso,
   isoFull, timezone`.

---

## Creating a spacetime object

```js
import spacetime from 'spacetime'          // ESM / TS / Deno
// const spacetime = require('spacetime')  // CommonJS

// from various inputs — 2nd arg is ALWAYS the timezone:
spacetime.now('America/New_York')          // right now, in that tz
spacetime(1489520157124, 'Canada/Pacific') // millisecond epoch
spacetime([2017, 5, 2], 'Canada/Pacific')  // [yyyy, M(0-based), d(1-based)] => Jun 2 2017
spacetime('July 2, 2017 5:01:00')          // parsed string
spacetime('2019/05/15')
spacetime('2017-04-03T08:00:00-0700')      // ISO-8601 with offset => tz 'Etc/GMT-7'
spacetime('2023-01-01T05:30[America/Denver]') // RFC 9557 (offset/tz in the string)
spacetime({ month: 'june', year: 2019 })   // key-value object input

// static helpers (each takes (timezone?, options?)):
spacetime.now()        // this exact moment
spacetime.today()      // this morning (start of today)
spacetime.tomorrow()   // tomorrow morning
spacetime.yesterday()  // yesterday morning
spacetime.min()        // earliest representable date (271,821 BC)
spacetime.max()        // furthest representable date (~27k years out)
spacetime.fromUnixSeconds(1489520157)      // SECONDS epoch -> Spacetime
```

`ParsableDate` (accepted by the constructor and by methods like `set`, `diff`,
`isAfter`, …) is: `Spacetime | Date | number | number[] | string`.

### Constructor options (3rd argument)

```js
spacetime('12/01/2018', null, { dmy: true })  // dd/mm/yyyy parsing (default is mm/dd US)
spacetime(123456, 'UTC', { silent: false })   // warn on suspicious 1970 epochs (default silent: true)
spacetime('June 5th', null, { today: { year: 1996, month: 3, date: 4 } }) // pin the "now" context
spacetime('...', tz, { weekStart: 1 })        // day the week starts on: 0=Sunday, 1=Monday (default), ...
```

Ambiguous string inputs assume: start of month (`'June 1992'` → the 1st),
current year (`'June 5th'`), and Jan 1st (`'2030'`).

---

## Reading values (getters)

```js
s.epoch          // property: milliseconds since 1970 (number)
s.tz             // property: IANA tz name string, e.g. 'america/denver'
s.year()         // 2017
s.month()        // 0-11   (NOT a name)
s.monthName()    // 'april'
s.date()         // 1-31   (day of month)
s.day()          // 0-6    (day of week, Sunday=0)
s.dayName()      // 'wednesday'
s.hour()         // 0-23
s.hour12()       // 0-11
s.minute()       // 0-59
s.time()         // '5:01am'
s.quarter()      // 1-4
s.season()       // 'spring' | 'summer' | 'fall'/'autumn' | 'winter'
s.week()         // 1-52
s.dayOfYear()    // 1-365
s.progress()     // { day, hour, week, month, quarter, season, year, ... } each 0..1
s.json()         // every unit as a key-value object
s.epochSeconds() // seconds (number) — note: METHOD, not .epoch
```

`progress` tells you how far through a unit you are: `s.progress().day === 0.5`
means noon; `s.progress().month === 0.23` means ~a quarter into the month.

---

## Changing values

### Set a specific unit (returns a new object)

```js
s = s.hour(5)          // 5am
s = s.date(15)         // the 15th
s = s.month('march')   // March 1st of the same year (names accepted)
s = s.quarter(2)       // April 1st
s = s.day('monday')    // this week's Monday
s = s.time('4:30pm')
s = s.set('march 5th 2020')   // set() takes any ParsableDate
```

### The `goForward` 2nd argument (key feature)

Most setters accept a boolean 2nd arg controlling search direction when the
target is ambiguous:

```js
s = s.day('monday')         // nearest/this-week's monday
s = s.day('monday', true)   // the NEXT monday (forward in time)
s = s.day('monday', false)  // the most-recent monday (backward)

s = s.time('4:00pm', true)  // the next 4pm in the future
s = s.set('march 4th', true)// next year's march 4th if it's already past
```

### Add / subtract / round (returns a new object)

```js
s = s.add(1, 'week')
s = s.subtract(2, 'months').add(1, 'day')   // chainable, each step immutable
s = s.startOf('day')        // 12:00am today
s = s.endOf('quarter')      // 11:59:59.999pm of the quarter
s = s.next('month')         // start of next month
s = s.last('year')          // start of previous year
s = s.nearest('hour')       // round to nearest hour
s = s.nearest('quarterHour')// 5:15, 5:30, 5:45...
```

`add`/`subtract` preserve clock-time intuitively: 9am Tuesday + 1 week is still
9am Tuesday, even across DST.

### `TimeUnit` values (used by add, subtract, startOf, endOf, diff, next, last, nearest, round, isSame, each)

`millisecond, second, minute, quarterHour, hour, day, week, month, quarter,
season, year, decade, century, date` — **plural forms are also accepted**
(`days`, `months`, `quarters`, `centuries`, …). Use singular or plural
interchangeably.

---

## Comparisons

```js
s.isAfter(d)                 // boolean   (d is Spacetime | Date | ParsableDate)
s.isBefore(d)
s.isEqual(d)                 // exact same millisecond
s.isBetween(start, end, inclusive?) // inclusive defaults to false
s.isSame(d, 'year')          // same calendar year? (also 'date','week','month'...)
s.diff(d, 'day')             // integer count of that unit between the two
s.diff(d)                    // => Diff object: {years, months, weeks, days, hours, ...}
```

All comparisons are timezone-sensitive: 8am EST is *before* 8am PST.

### Human-readable differences

```js
now.since(before)  // => Since object
// {
//   diff: { months: 11, days: 30, ... },
//   rounded: 'in 12 months',
//   qualified, precise, abbreviated: [...],
//   iso: 'P...', direction: 'past' | 'present' | 'future'
// }
```

`from(date)` is an alias of `since`. `fromNow(date)` compares against now.

### Iterating a range

```js
s.every('week', 'Jan 1st 2020')   // => Spacetime[] every week up to that date
s.each('day', endDate)            // => Spacetime[] (in tz of the starting date)
```

---

## Timezones

```js
s = s.goto('Australia/Brisbane') // SAME moment, new wall-clock & tz
s = s.goto(null)                 // back to the local machine/browser tz
s.timezone()                     // metadata object (see TimezoneMeta below)
s = s.timezone('Europe/Zagreb')  // SETTER: keep the wall-clock numbers, swap tz

s.offset()        // current DST-aware UTC offset in HOURS (number)
s.hemisphere()    // 'North' | 'South'
s.isDST()         // is DST active right now in this tz?
s.hasDST()        // does this tz ever observe DST?
s.timezones       // property: full tz nameset
spacetime.timezones()              // static: all known tz + offsets
spacetime.whereIts('8:30pm', '9:30pm') // tz names currently in that time-window
```

**`goto` vs `timezone(str)` — do not confuse them:**
- `goto(tz)` keeps the **instant** fixed and recomputes the local time
  (3pm New York → 8pm London, same moment).
- `timezone(tz)` keeps the **clock numbers** fixed and relabels the zone
  (3pm New York → 3pm London, a different moment).

`goto()` never crosses the international date line.

---

## Formatting

### `format(token)` — named tokens

```js
s.format('nice')        // 'Apr 1st, 4:32pm'
s.format('nice-year')   // 'Apr 1st, 2017'
s.format('time')        // '5:01am'
s.format('time-24')     // '17:01'
s.format('month')       // 'April'
s.format('month-short') // 'Apr'
s.format('month-pad')   // '04'
s.format('numeric-uk')  // '02/03/2017' (dd/mm/yyyy)
s.format('numeric-us')  // '03/02/2017' (mm/dd/yyyy)
s.format('iso')         // '2017-04-03T08:00:00.000-04:00'
s.format('iso-utc')     // ISO in UTC
s.format('iso-full')    // '2011-12-03T10:15:30.010+01:00[Europe/Paris]' (RFC 9557)
s.format('sql')         // '2011-12-03 10:15:30' (ISO 9075)
```

Common tokens (each has sensible variants — see `src/methods/format/index.js`
for the full list): `day, day-short, day-number, day-ordinal, day-pad, date,
date-ordinal, date-pad, month, month-short, month-number, month-ordinal,
month-pad, year, year-short, time, time-24, hour, hour-24, minute, second,
millisecond, ampm, quarter, season, era, timezone, offset, numeric, numeric-us,
numeric-uk, mm/dd, iso, iso-short, iso-utc, iso-full, sql, nice, nice-year,
nice-day, nice-full`.

### Inline templates with `{}`

Any named token works inside `{ }`:

```js
s.format('{year}-{month-pad}-{date-pad}') // '2018-03-02'
s.format("{hour} o'clock")                // "2 o'clock"
s.format('{time}{ampm} sharp')            // '2:30pm sharp'
```

### `unixFmt(pattern)` — Unicode/Moment-style tokens

```js
s.unixFmt('yyyy.MM.dd h:mm a')  // '2017.Nov.16 11:34 AM'
```

Tokens: `y yy yyy yyyy yyyyy` (year), `MMMM MMM MM M` (month), `dd d` (date),
`eeee…e` (weekday), `a` (am/pm), `h hh` (12h hour), `H HH` (24h), `m mm`
(minute), `s ss` (second), `z…zzzz` (timezone). See `src/methods/format/unixFmt.js`.

### Other helpers

```js
s.iso()           // ISO-8601 string (also a setter: s.iso('...'))
s.isoFull()       // RFC 9557 extended ISO with [tz]
s.toNativeDate()  // -> native JS Date (drops back to local tz)
s.toLocalDate()   // DEPRECATED alias of toNativeDate()
s.log()           // pretty-print to console, returns self (debug)
```

⚠️ **Deprecated:** the `.d` property (use `toNativeDate()`), `.toLocalDate()`.

---

## Boolean / convenience checks

```js
s.isValid()    // false for impossible dates (e.g. Sept 32nd)
s.leapYear()   // boolean
s.isAwake()    // between 8am and 10pm
s.isAsleep()   // between 10pm and 8am
s.daysInMonth()// 28/29/30/31
```

---

## Extending & i18n

```js
// Add custom instance methods (use `function`, not arrow, to keep `this`):
spacetime.extend({
  isHappyHour: function () { return this.hour() === 16 }
})
spacetime.now().isHappyHour() // false

// Plugins are installed the same way:
spacetime.extend(require('timezone-soft')) // enables s.goto('milwaukee'), 'GMT+8', etc.

// Non-English output:
s = s.i18n({
  days:   { long: ['domingo', ...], short: ['dom', ...] },
  months: { long: [...], short: ['ene', 'feb', ...] },
  ampm:   { am: 'a.m.', pm: 'p.m.' }
})
```

Official plugins live in `plugins/`: `age`, `daylight`, `geo`, `holiday`,
`week-of-month`, `week-start`, `ticks`, and more.

---

## Type reference (from `types/`)

```ts
type ParsableDate = Spacetime | Date | number | number[] | string

interface Diff {
  years; quarters; months; weeks; days; hours; minutes; seconds; milliseconds // all number
}

interface Since {
  diff: Diff
  rounded: string        // 'in 12 months'
  qualified: string
  precise: string
  abbreviated: string[]
  iso: string
  direction: 'past' | 'present' | 'future'
}

interface TimezoneMeta {
  name: string
  hemisphere: string
  hasDst: boolean
  default_offset: number
  display: string
  current: { offset: number; isDST: boolean }
  change?: { start: string; back: string }
}

interface Progress { day; hour; minute; month; quarter; quarterHour; season; week; year } // each 0..1
```

---

## Common LLM mistakes — checklist

- ❌ `s.add(1, 'day'); use(s)` → ✅ `s = s.add(1, 'day'); use(s)` (immutable).
- ❌ Treating `s.month()` as 1-based or as a name → it is `0`–`11`. Use
  `s.monthName()` for the string, `s.format('month')` for 'April'.
- ❌ `spacetime([2017, 5, 2])` "= May 2" → it is **June 2** (month is 0-based).
- ❌ Passing a seconds epoch to `spacetime(...)` → use
  `spacetime.fromUnixSeconds(...)`.
- ❌ Putting the timezone first → timezone is the **2nd** argument.
- ❌ Using `goto()` when you meant `timezone()` (or vice versa) — see the
  goto-vs-timezone note above.
- ❌ Expecting `s.epoch()` / `s.tz()` as methods → `epoch` and `tz` are
  **properties** (no parentheses). `epochSeconds()` *is* a method.
- ❌ Arrow functions in `spacetime.extend({...})` → use `function () {}` so
  `this` is the Spacetime instance.

---

## Minimal end-to-end example

```js
import spacetime from 'spacetime'

let s = spacetime('March 1 2012', 'America/New_York')
s = s.time('4:20pm')          // capture every change
s = s.goto('America/Los_Angeles')
s.time()                      // '1:20pm'  (same instant, west-coast clock)
s.diff(s.endOf('year'), 'days')
s.format('nice-full')         // 'Thursday March 1st, 1:20pm'
```
