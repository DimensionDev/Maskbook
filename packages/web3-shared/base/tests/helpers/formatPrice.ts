import { describe, test, expect } from 'vitest'
import { formatPrice } from '../../src/helpers/formatPrice.js'

describe('formatPrice util test', () => {
    test.each([
        { give: 299, significant: 10, expected: '299' },
        { give: 299.1, significant: 0, expected: '299' },
        { give: 299.1, significant: 1, expected: '299.1' },
        { give: 0.1111, significant: 3, expected: '0.111' },
        { give: 0.1111, significant: 5, expected: '0.1111' },
    ])('.format($give)', ({ give, significant, expected }) => {
        expect(formatPrice(give, significant)).toBe(expected)
    })
})
