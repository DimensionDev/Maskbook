import { describe, test, expect } from 'vitest'
import { formatCurrency } from '../../src/helpers/formatCurrency.js'

describe('USD Currency price format util test', () => {
    test.each([
        { give: 0, expected: '$0.00' },
        { give: 0.1, expected: '$0.1' },
        { give: 0.2, expected: '$0.2' },
        { give: 0.12, expected: '$0.12' },
        { give: 0.123_411_1, expected: '$0.123411' },
        { give: 0.123_411_5, expected: '$0.123412' },
        { give: 1, expected: '$1.00' },
        { give: 1.1, expected: '$1.10' },
        { give: 1.55, expected: '$1.55' },
        { give: 2, expected: '$2.00' },
        { give: 2.11, expected: '$2.11' },
        { give: 2.111, expected: '$2.11' },
        { give: 2.115, expected: '$2.12' },
        { give: 2_000_000_000_000, expected: '$2,000,000,000,000.00' },
        { give: 0.1234, expected: '$0.1234' },
        { give: 0.123_411_1, expected: '$0.123411' },
        { give: 0.123_411_5, expected: '$0.123412' },
        { give: 0.000_001, expected: '$0.000001' },
        { give: 0.000_001_01, expected: '$0.000001' },
        { give: 0.000_002, expected: '$0.000002' },
        { give: 1e-9, expected: '$0.000000001' },
        { give: 1e-13, expected: '< $0.000001' },
        { give: 0.999_363_111_2, expected: '$0.999363' },
        { give: 0.000_000_002_636, expected: '$0.000000002636' },
        { give: 0.000_000_002_636, expected: '< $0.01', options: { onlyRemainTwoDecimal: true } },
        { give: 0.032_112, expected: '$0.03', options: { onlyRemainTwoDecimal: true } },
        { give: 1.999_363, expected: '$2.00' },
    ])('.formatCurrency($give)', ({ give, expected, options }) => {
        expect(formatCurrency(give, undefined, options)).toBe(expected)
    })
})

describe('EUR Currency format util test', () => {
    test.each([
        { give: 0, expected: '\u20AC0.00' },
        { give: 0.1, expected: '\u20AC0.1' },
        { give: 0.2, expected: '\u20AC0.2' },
        { give: 0.12, expected: '\u20AC0.12' },
        { give: 0.123_411_1, expected: '\u20AC0.123411' },
        { give: 0.123_411_5, expected: '\u20AC0.123412' },
        { give: 1, expected: '\u20AC1.00' },
        { give: 1.1, expected: '\u20AC1.10' },
        { give: 1.55, expected: '\u20AC1.55' },
        { give: 2, expected: '\u20AC2.00' },
        { give: 2.11, expected: '\u20AC2.11' },
        { give: 2.111, expected: '\u20AC2.11' },
        { give: 2.115, expected: '\u20AC2.12' },
        { give: 2_000_000_000_000, expected: '\u20AC2,000,000,000,000.00' },
        { give: 0.1234, expected: '\u20AC0.1234' },
        { give: 0.123_411_1, expected: '\u20AC0.123411' },
        { give: 0.123_411_5, expected: '\u20AC0.123412' },
        { give: 0.000_001, expected: '\u20AC0.000001' },
        { give: 0.000_001_01, expected: '\u20AC0.000001' },
        { give: 0.000_002, expected: '\u20AC0.000002' },
        { give: 0.000_000_135_554_455, expected: '\u20AC0.0000001356' },
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
        { give: 0.000_000_001, currency: 'MATIC', expected: '0.000000001 MATIC' },
        { give: 1.55, currency: 'MATIC', expected: '1.55 MATIC' },
        { give: 1.554_555_5, currency: 'MATIC', expected: '1.55 MATIC' },
        { give: 2.000_000_01, currency: 'MATIC', expected: '2.00 MATIC' },
        { give: 0.125_500_25, currency: 'MATIC', expected: '0.1255 MATIC' },
        { give: 0.000_000_135_554_455, currency: 'MATIC', expected: '0.0000001356 MATIC' },
        { give: 0.000_000_000_000_111_135, currency: 'MATIC', expected: '< 0.000001 MATIC' },
    ])('.format($give)', ({ give, currency, expected }) => {
        const result = formatCurrency(give, currency)

        expect(result).toBe(expected)
    })
})

describe('None currency format util test', () => {
    test.each([
        { give: 0, currency: '', expected: '0.00' },
        { give: 1.55, currency: '', expected: '1.55' },
        { give: 0.000_000_01, currency: '', expected: '0.00000001' },
        { give: 2.000_000_01, currency: '', expected: '2.00' },
        { give: 0.125_500_25, currency: '', expected: '0.1255' },
        { give: 0.335_589_9, currency: '', expected: '0.33559' },
        { give: 0.000_000_135_554_455, currency: '', expected: '0.0000001356' },
        { give: 0.000_000_002_636_1, currency: '', expected: '0.000000002636' },
        { give: 0.000_000_000_000_111_135, currency: '', expected: '< 0.000001' },
        { give: 56.135_121_2, currency: '', expected: '56.14' },
    ])('.format($give)', ({ give, currency, expected }) => {
        const result = formatCurrency(give, currency)
        expect(result).toBe(expected)
    })
})
