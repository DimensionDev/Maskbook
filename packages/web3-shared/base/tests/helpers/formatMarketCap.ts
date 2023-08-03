import { describe, test, expect } from 'vitest'
import { formatMarketCap } from '../../src/helpers/formatMarketCap.js'

describe('Market Cap format util test', () => {
    test.each([
        { give: 99, expected: '$99' },
        { give: 100, expected: '$100' },
        { give: 999, expected: '$999' },
        { give: 1000, expected: '$1k' },
        { give: 1001, expected: '$1k' },
        { give: 1010, expected: '$1.01k' },
        { give: 1016, expected: '$1.02k' },
        { give: 99999, expected: '$100k' },
        { give: 100000, expected: '$100k' },
        { give: 999999, expected: '$1M' },
        { give: 1000000, expected: '$1M' },
        { give: 1000001, expected: '$1M' },
        { give: 1010000, expected: '$1.01M' },
        { give: 1011000, expected: '$1.01M' },
        { give: 1016000, expected: '$1.02M' },
        { give: 194987089, expected: '$194.99M' },
        { give: 999999999, expected: '$1B' },
        { give: 1000000000, expected: '$1B' },
        { give: 1010000000, expected: '$1.01B' },
        { give: 1011000000, expected: '$1.01B' },
        { give: 1016000000, expected: '$1.02B' },
        { give: 9906374170, expected: '$9.91B' },
        { give: 17729505549, expected: '$17.73B' },
        { give: 1000000000000, expected: '$1T' },
        { give: 9900000000000, expected: '$9.90T' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatMarketCap(give)).toBe(expected)
    })
})
