import { describe, test, expect } from 'vitest'
import { formatCurrency } from '../../src/helpers/formatCurrency.js'
import { CurrencyType } from '../../src/index.js'

describe('USD Currency price format util test', () => {
    test.each([
        { give: 0, expected: '$0.00' },
        { give: 0.1, expected: '$0.1' },
        { give: 0.2, expected: '$0.2' },
        { give: 0.12, expected: '$0.12' },
        { give: 0.1234111, expected: '$0.123411' },
        { give: 0.1234115, expected: '$0.123412' },
        { give: 1, expected: '$1.00' },
        { give: 1.1, expected: '$1.10' },
        { give: 1.55, expected: '$1.55' },
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
        { give: 1e-9, expected: '$0.000000001' },
        { give: 1e-13, expected: '< $0.000001' },
        { give: 0.9993631112, expected: '$0.999363' },
        { give: 0.000000002636, expected: '$0.000000002636' },
        { give: 0.000000002636, expected: '< $0.01', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: 0.032112, expected: '$0.03', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: 1.999363, expected: '$2.00' },
        { give: '0.998994883856411', expected: '$1.00', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: '1.998994883856411', expected: '$2.00', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: '11.998994883856411', expected: '$12.00', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: '11.998994883856411', expected: '$12.00' },
        { give: 1.2, sign: CurrencyType.CNY, expected: '¥12.00', options: { fiatCurrencyRate: 10 } },
        { give: 1.2, sign: CurrencyType.HKD, expected: 'HK$12.00', options: { fiatCurrencyRate: 10 } },
    ])('.formatCurrency($give)', ({ give, expected, sign, options }) => {
        expect(formatCurrency(give, sign, options)).toBe(expected)
    })
})

describe('JPY Currency format util test', () => {
    test.each([
        { give: 0, expected: '¥0' },
        { give: 11.111, expected: '¥11.11' },
        { give: 0.0111, expected: '¥0.0111' },
        { give: 11.1, expected: '¥11', options: { onlyRemainTwoOrZeroDecimal: true } },
        { give: 0.1, expected: '< ¥1', options: { onlyRemainTwoOrZeroDecimal: true } },
    ])('.format($give)', ({ give, expected, options }) => {
        expect(formatCurrency(give, CurrencyType.JPY, options)).toBe(expected)
    })
})

describe('EUR Currency format util test', () => {
    test.each([
        { give: 0, expected: '\u20AC0.00' },
        { give: 0.1, expected: '\u20AC0.1' },
        { give: 0.2, expected: '\u20AC0.2' },
        { give: 0.12, expected: '\u20AC0.12' },
        { give: 0.1234111, expected: '\u20AC0.123411' },
        { give: 0.1234115, expected: '\u20AC0.123412' },
        { give: 1, expected: '\u20AC1.00' },
        { give: 1.1, expected: '\u20AC1.10' },
        { give: 1.55, expected: '\u20AC1.55' },
        { give: 2, expected: '\u20AC2.00' },
        { give: 2.11, expected: '\u20AC2.11' },
        { give: 2.111, expected: '\u20AC2.11' },
        { give: 2.115, expected: '\u20AC2.12' },
        { give: 2000000000000, expected: '\u20AC2,000,000,000,000.00' },
        { give: 0.1234, expected: '\u20AC0.1234' },
        { give: 0.1234111, expected: '\u20AC0.123411' },
        { give: 0.1234115, expected: '\u20AC0.123412' },
        { give: 0.000001, expected: '\u20AC0.000001' },
        { give: 0.00000101, expected: '\u20AC0.000001' },
        { give: 0.000002, expected: '\u20AC0.000002' },
        { give: 0.000000135554455, expected: '\u20AC0.0000001356' },
        { give: 1e-15, expected: '< \u20AC0.000001' },
    ])('.format($give)', ({ give, expected }) => {
        expect(formatCurrency(give, 'EUR')).toBe(expected)
    })
})

describe('Digital currency format util test', () => {
    test.each([
        { give: 0, currency: 'ETH', expected: '0.00 \u039E' },
        { give: 1.55, currency: 'ETH', expected: '1.55 \u039E' },
        { give: 1.55, currency: 'BTC', expected: '1.55 \u20BF' },
        { give: 0, currency: 'MATIC', expected: '0.00 MATIC' },
        { give: 0.000000001, currency: 'MATIC', expected: '0.000000001 MATIC' },
        { give: 1.55, currency: 'MATIC', expected: '1.55 MATIC' },
        { give: 1.5545555, currency: 'MATIC', expected: '1.55 MATIC' },
        { give: 2.00000001, currency: 'MATIC', expected: '2.00 MATIC' },
        { give: 0.12550025, currency: 'MATIC', expected: '0.1255 MATIC' },
        { give: 0.000000135554455, currency: 'MATIC', expected: '0.0000001356 MATIC' },
        { give: 0.000000000000111135, currency: 'MATIC', expected: '< 0.000001 MATIC' },
    ])('.format($give)', ({ give, currency, expected }) => {
        const result = formatCurrency(give, currency)

        expect(result).toBe(expected)
    })
})

describe('None currency format util test', () => {
    test.each([
        { give: 0, currency: '', expected: '0.00' },
        { give: 1.55, currency: '', expected: '1.55' },
        { give: 0.00000001, currency: '', expected: '0.00000001' },
        { give: 2.00000001, currency: '', expected: '2.00' },
        { give: 0.12550025, currency: '', expected: '0.1255' },
        { give: 0.3355899, currency: '', expected: '0.33559' },
        { give: 0.000000135554455, currency: '', expected: '0.0000001356' },
        { give: 0.0000000026361, currency: '', expected: '0.000000002636' },
        { give: 0.000000000000111135, currency: '', expected: '< 0.000001' },
        { give: 56.1351212, currency: '', expected: '56.14' },
    ])('.format($give)', ({ give, currency, expected }) => {
        const result = formatCurrency(give, currency)
        expect(result).toBe(expected)
    })
})
