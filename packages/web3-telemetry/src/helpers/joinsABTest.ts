import { getABTestSeed } from './getABTestSeed.js'

/**
 * Returns true if the install joins the a/b test.
 * @param percent 0 - 100
 */

export function joinsABTest(percent = 50): boolean {
    if (percent === 0) return false
    if (percent === 100) return true
    if (percent < 0 || percent > 100) throw new RangeError('percent must be between 0 and 100')
    return getABTestSeed(100) <= percent
}
