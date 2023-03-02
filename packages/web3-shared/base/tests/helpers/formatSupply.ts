import { describe, test, expect } from 'vitest'
import { formatSupply } from '../../src/helpers/formatSupply.js'

describe('Supply format util test', () => {
    test.each([
        { give: 0, expected: '0' },
        { give: 1e-11, expected: '0' },
        { give: 0.0101, expected: '0.01' },
        { give: 0.0102, expected: '0.01' },
        { give: 1.55, expected: '1.55' },
        { give: 7441.09, expected: '7,441.09' },
        { give: 99_999, expected: '99,999' },
        { give: 99_999.01, expected: '99,999.01' },
        { give: 99_999.0101, expected: '99,999.01' },
        { give: 99_999.0151, expected: '99,999.02' },
        { give: 195_669.86, expected: '195,669.86' },
        { give: 1_000_001, expected: '1,000,001' },
        { give: 1_000_001.01, expected: '1,000,001.01' },
        { give: 12_932_273, expected: '12,932,273' },
        { give: 100_000_000, expected: '100,000,000' },
        { give: 52_488_984_654, expected: '5.25e+10' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatSupply(give)).toBe(expected)
    })
})
