declare const assert: {
  ok(value: unknown, msg?: string): void
  notOk(value: unknown, msg?: string): void
  equal(actual: unknown, expected: unknown, msg?: string): void
  notEqual(actual: unknown, expected: unknown, msg?: string): void
  deepEqual(actual: unknown, expected: unknown, msg?: string): void
  throws(fn: () => unknown, msg?: string): void
  doesNotThrow(fn: () => unknown, msg?: string): void
}
export default assert
