import { describe, test, expect } from 'vitest'
import { formatBalance, leftShift, toFixed } from '../src/index.js'

describe('formatBalance util test', () => {
    test.each([
        { give: 123456789, decimals: 0, significant: 0, expected: '123456789' },
        { give: 123456789, decimals: 1, significant: 1, expected: '12345678.9' },
        { give: 123456789, decimals: 2, significant: 2, expected: '1234567.89' },
        { give: 123456789, decimals: 9, significant: 9, expected: '0.123456789' },
        { give: 123456789, decimals: 10, significant: 10, expected: '0.0123456789' },
        { give: 123456789, decimals: 0, significant: 6, expected: '123456789' },
        { give: 123456789, decimals: 1, significant: 0, expected: '12345678.9' },
        { give: 123456789, decimals: 1, significant: 6, expected: '12345678.9' },
        { give: 123456789, decimals: 9, significant: 1, expected: '0.1' },
        { give: 123456789, decimals: 9, significant: 2, expected: '0.12' },
        { give: 123456789, decimals: 9, significant: 3, expected: '0.123' },
        { give: 123456789, decimals: 9, significant: 4, expected: '0.1234' },
        { give: 123456789, decimals: 10, significant: 1, expected: '0.01' },
        { give: 123456789, decimals: 10, significant: 2, expected: '0.012' },
        { give: 123456789, decimals: 10, significant: 3, expected: '0.0123' },
        { give: 123456789, decimals: 10, significant: 4, expected: '0.01234' },
        { give: 123456789, decimals: 15, significant: 16, expected: '<0.000001' },
        { give: 123456789, decimals: 15, significant: 17, expected: '<0.000001' },
        { give: 123456789, decimals: 15, significant: 18, expected: '<0.000001' },
        { give: 123456789, decimals: 15, significant: 19, expected: '<0.000001' },
        { give: 123456789, decimals: 20, significant: 20, expected: '<0.000001' },
        { give: 1.05, decimals: 6, significant: 20, expected: '0.000001' },
    ])('.format($give)', ({ give, decimals, significant, expected }) => {
        expect(formatBalance(give, decimals, significant)).toBe(expected)
    })
})

describe('leftShift util test', () => {
    test.each([
        { give: 1, shift: 1, expected: '0.1' },
        { give: 1, shift: 2, expected: '0.01' },
        { give: 1, shift: 3, expected: '0.001' },
        { give: 1, shift: 4, expected: '0.0001' },
    ])('.format($give)', ({ give, shift, expected }) => {
        expect(leftShift(give, shift).toFixed()).toBe(expected)
    })
})

describe('toFixed', () => {
    test.each([{ give: '10428.8', expected: '10429' }])('.format($give)', ({ give, expected }) => {
        expect(toFixed(give, 0)).toBe(expected)
    })
})
