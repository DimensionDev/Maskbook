import { describe, test, expect } from '@jest/globals'
import { formatCurrency } from '../src'

describe('Currency format util test', () => {
    test.each([
        { give: 0, expected: '$0.00' },
        { give: 0.1, expected: '$0.1' },
        { give: 0.2, expected: '$0.2' },
        { give: 0.12, expected: '$0.12' },
        { give: 0.1234111, expected: '$0.123411' },
        { give: 0.1234115, expected: '$0.123412' },
        { give: 1, expected: '$1.00' },
        { give: 1.1, expected: '$1.10' },
        { give: 2, expected: '$2.00' },
        { give: 2.11, expected: '$2.11' },
        { give: 2.111, expected: '$2.11' },
        { give: 2.115, expected: '$2.12' },
        { give: 2000000000000, expected: '$2,000,000,000,000.00' },
        { give: 0.1234, expected: '$0.1234' },
        { give: 0.1234111, expected: '$0.123411' },
        { give: 0.1234115, expected: '$0.123412' },
        { give: 0.000001, expected: '$0.000001' },
        { give: 0.00000101, expected: '$0.000001' },
        { give: 0.000002, expected: '$0.000002' },
        { give: 0.000000000000001, expected: '< $0.000001' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatCurrency(give)).toBe(expected)
    })
})
