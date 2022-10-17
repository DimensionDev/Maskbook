import { describe, test, expect } from 'vitest'
import { isValidAddress } from '../src/utils/address'

describe('Solana address utilities', () => {
    test.each([
        {
            input: 'EZXbaV3',
            result: false,
        },
        {
            input: 'EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZUEZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU',
            result: false,
        },
        {
            input: 'EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU',
            result: true,
        },
        {
            input: '5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf',
            result: true,
        },
    ])('isValidAddress', ({ input, result }) => {
        expect(isValidAddress(input)).toBe(result)
    })
})
