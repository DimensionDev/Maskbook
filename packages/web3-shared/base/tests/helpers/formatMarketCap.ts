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
        { give: 99_999, expected: '$100k' },
        { give: 100_000, expected: '$100k' },
        { give: 999_999, expected: '$1M' },
        { give: 1_000_000, expected: '$1M' },
        { give: 1_000_001, expected: '$1M' },
        { give: 1_010_000, expected: '$1.01M' },
        { give: 1_011_000, expected: '$1.01M' },
        { give: 1_016_000, expected: '$1.02M' },
        { give: 194_987_089, expected: '$194.99M' },
        { give: 999_999_999, expected: '$1B' },
        { give: 1_000_000_000, expected: '$1B' },
        { give: 1_010_000_000, expected: '$1.01B' },
        { give: 1_011_000_000, expected: '$1.01B' },
        { give: 1_016_000_000, expected: '$1.02B' },
        { give: 9_906_374_170, expected: '$9.91B' },
        { give: 17_729_505_549, expected: '$17.73B' },
        { give: 1_000_000_000_000, expected: '$1e+12' },
        { give: 9_900_000_000_000, expected: '$9.9e+12' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatMarketCap(give)).toBe(expected)
    })
})
