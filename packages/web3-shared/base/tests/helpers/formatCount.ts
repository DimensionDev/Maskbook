import { describe, test, expect } from 'vitest'
import { formatCount } from '../../src/helpers/formatCount.js'

describe('formatCount util test', () => {
    test.each([
        { give: 100, precision: 1, expected: '100' },
        { give: 1001, precision: 1, expected: '1K' },
        { give: 1100, precision: 1, expected: '1.1K' },
        { give: 1120, precision: 2, expected: '1.12K' },
        { give: 11201, precision: 2, expected: '11.2K' },
        { give: 1120000, precision: 2, expected: '1.12M' },
        { give: 11231000, precision: 2, expected: '11.23M' },
        { give: 1123100000, precision: 2, expected: '1.12B' },
    ])('.format($give $precision)', ({ give, precision, expected }) => {
        expect(formatCount(give, precision)).toBe(expected)
    })
})
