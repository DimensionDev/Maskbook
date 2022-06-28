import { describe, test, expect } from '@jest/globals'
import { formatSupply } from '../src'

describe('Supply format util test', () => {
    test.each([
        { give: 1000000, expected: '1e+6' },
        { give: 1000001, expected: '1.000001e+6' },
        { give: 1000001.0, expected: '1.000001e+6' },
        { give: 1000001.01, expected: '1.00000101e+6' },
        { give: 99999, expected: '99,999.0' },
        { give: 99999.01, expected: '99,999.01' },
        { give: 99999.0101, expected: '99,999.01' },
        { give: 0.0101, expected: '0.01' },
        { give: 0.0102, expected: '0.01' },
        { give: 0.00000000001, expected: '0.0' },
        { give: 0, expected: '0.0' },
        { give: 99999.0151, expected: '99,999.02' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatSupply(give)).toBe(expected)
    })
})
