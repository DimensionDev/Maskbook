import { describe, test, expect } from 'vitest'
import { leftShift, toFixed, trimZero } from '../../src/helpers/number.js'

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

describe('trimZero', () => {
    test.each([
        {
            give: '100',
            expected: '100',
        },
        {
            give: '100.00',
            expected: '100',
        },
        {
            give: '0.11',
            expected: '0.11',
        },
        {
            give: '0.1100',
            expected: '0.11',
        },
        {
            give: '1.00',
            expected: '1',
        },
    ])('trimZero($give)', ({ give, expected }) => {
        expect(trimZero(give)).toBe(expected)
    })
})
