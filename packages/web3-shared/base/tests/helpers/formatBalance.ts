import { describe, test, it, expect } from 'vitest'
import { formatBalance } from '../../src/helpers/formatBalance.js'
import { scale10 } from '../../src/helpers/number.js'

describe('formatBalance util test', () => {
    test.each([
        { give: 123456789, decimals: 0, significant: 0, expected: '123,456,789' },
        { give: 123456789, decimals: 1, significant: 1, expected: '12,345,678.9' },
        { give: 123456789, decimals: 2, significant: 2, expected: '1,234,567.89' },
        { give: 123456789, decimals: 9, significant: 9, expected: '0.123456' },
        { give: 123456789, decimals: 10, significant: 10, expected: '0.012345' },
        { give: 123456789, decimals: 0, significant: 6, expected: '123,456,789' },
        { give: 123456789, decimals: 1, significant: 0, expected: '12,345,678.9' },
        { give: 123456789, decimals: 1, significant: 6, expected: '12,345,678.9' },
        { give: 123456789, decimals: 9, significant: 1, expected: '0.1' },
        { give: 123456789, decimals: 9, significant: 2, expected: '0.12' },
        { give: 123456789, decimals: 9, significant: 3, expected: '0.123' },
        { give: 123456789, decimals: 9, significant: 4, expected: '0.1234' },
        { give: 123456789, decimals: 10, significant: 1, expected: '0.01' },
        { give: 123456789, decimals: 10, significant: 2, expected: '0.012' },
        { give: 123456789, decimals: 10, significant: 3, expected: '0.0123' },
        { give: 123456789, decimals: 10, significant: 4, expected: '0.01234' },
        { give: 123456789, decimals: 15, significant: 16, expected: '0.00000012' },
        { give: 23456789, decimals: 15, significant: 17, expected: '0.00000002' },
        { give: 123456789, decimals: 15, significant: 18, expected: '0.00000012' },
        { give: 123456789, decimals: 15, significant: 19, expected: '0.00000012' },
        { give: 123456789, decimals: 20, significant: 20, expected: '<0.000001' },
        { give: 352476637275640, decimals: 18, significant: 2, expected: '0.00035' },
        { give: 133555, decimals: 12, significant: 20, expected: '0.00000013' },
        { give: 1, decimals: 6, significant: 20, expected: '0.000001' },
        { give: 1, decimals: 7, significant: 20, expected: '0.0000001' },
        { give: 10, decimals: 7, significant: 20, expected: '0.000001' },
        { give: 11, decimals: 9, significant: 20, expected: '0.00000001' },
        { give: 11, decimals: 10, significant: 20, expected: '<0.000001' },
    ])('.format($give $decimals $significant) should return $expected', ({ give, decimals, significant, expected }) => {
        expect(formatBalance(give, decimals, { significant })).toBe(expected)
    })

    describe('fixed mode', () => {
        test.each([
            { give: 1000, decimals: 18, isFixed: true, fixedDecimals: 4, expected: '<0.0001' },
            { give: 0, decimals: 18, isFixed: true, fixedDecimals: 4, expected: '0' },
            { give: scale10(123, 14), decimals: 18, isFixed: true, fixedDecimals: 4, expected: '0.0123' },
            { give: scale10(123, 16), decimals: 18, isFixed: true, fixedDecimals: 4, expected: '1.23' },
            { give: scale10(123.456, 16), decimals: 18, isFixed: true, fixedDecimals: 4, expected: '1.2346' },
            { give: scale10(12.345678, 16), decimals: 18, isFixed: true, fixedDecimals: 4, expected: '0.1235' },
            { give: scale10(123, 18), decimals: 18, isFixed: true, fixedDecimals: 4, expected: '123' },
        ])(
            '.format($give $decimals $isFixed, $fixedDecimals)',
            ({ give, decimals, expected, isFixed, fixedDecimals }) => {
                expect(
                    formatBalance(give, decimals, { significant: 0, isPrecise: false, isFixed, fixedDecimals }),
                ).toBe(expected)
            },
        )
    })

    it('should raise an error if pass decimal number', () => {
        expect(() => formatBalance(1.05)).toThrowError()
    })
})
