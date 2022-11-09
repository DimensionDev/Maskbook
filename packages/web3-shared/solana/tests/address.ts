import { describe, test, expect } from 'vitest'
import { isValidAddress } from '../src/utils/address.js'

describe('Solana address utilities', () => {
    test.each<{
        args: [address: string, strict?: boolean]
        result: boolean
    }>([
        {
            args: ['EZXbaV3'],
            result: false,
        },
        {
            args: ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZUEZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU'],
            result: false,
        },
        {
            args: ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU'],
            result: true,
        },
        {
            args: ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf'],
            result: false,
        },
        {
            args: ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf', false],
            result: true,
        },
    ])('isValidAddress', ({ args, result }) => {
        expect(isValidAddress(...args)).toBe(result)
    })
})
