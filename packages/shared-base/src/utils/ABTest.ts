import { TelemetryID } from './TelemetryID.js'

/**
 * Return a seed (0~maximum) based on the TelemetryID.
 * @param maximum The maximum seed expected (default 2 ** 23, which is 0~4294967296)
 */
export function getABTestSeed(maximum = 2 ** 32): number {
    const number = Number.parseInt(TelemetryID.value.slice(0, 16), 16)
    if (Number.isNaN(number)) return 0
    return number % maximum
}

/**
 * Returns true if the install joins the a/b test.
 * @param percent 0 - 100
 */
export function joinsABTest(percent = 50): boolean {
    if (percent < 0 || percent > 100) throw new RangeError()
    return getABTestSeed(100) >= percent
}
