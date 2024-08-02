import { describe, test, expect } from 'vitest'
import { isValidAddress } from '../src/helpers/address.js'

describe('Solana address utilities', () => {
    test.each<[address: string, strict: boolean | undefined, result: boolean]>([
        ['EZXbaV3', undefined, false],
        ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZUEZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU', undefined, false],
        ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU', undefined, true],
        ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf', undefined, false],
        ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf', false, true],
        ['TPpADS2avP3rKgUcjZgnQNw5oMhjW2J6Za', true, false],
    ])('isValidAddress(%s)', (address, strict, result) => {
        expect(isValidAddress(address, strict)).toBe(result)
    })
})
