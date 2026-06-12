// a custom node:test reporter that passes-through the flat tap lines
// printed by test/lib/assert.js, instead of node's own nested tap output.
// this keeps `node --test | tap-dancer` looking identical to the old tape output.
export default async function* flatTap(source) {
  for await (const event of source) {
    if (event.type === 'test:stdout') {
      yield event.data.message
    } else if (event.type === 'test:stderr') {
      process.stderr.write(event.data.message)
    } else if (event.type === 'test:fail') {
      const err = event.data.details && event.data.details.error
      // parent tests fail when a child does - only report real crashes once
      if (err && err.failureType === 'subtestsFailed') {
        continue
      }
      // a thrown error (not a failed assertion) - report it as a tap failure
      const cause = (err && err.cause) || err || {}
      const firstLine = String(cause.message || cause).split('\n')[0]
      let out = `not ok ${event.data.name}\n`
      out += '  ---\n'
      out += '    operator: error\n'
      out += '    expected: test should not throw\n'
      out += `    actual:   '${firstLine}'\n`
      out += '  ...\n'
      yield out
    }
  }
}
