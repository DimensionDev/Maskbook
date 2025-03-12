import { describe, test, expect } from 'vitest'
import { isValidAddress } from '../src/helpers/address.js'

describe('Solana address utilities', () => {
    test.each<[address: string, result: boolean]>([
        ['EZXbaV3', false],
        ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZUEZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU', false],
        ['EZXbaV3Lntre7DdvRyxmQoEk8cpMvfY8v2eC3qP9ntZU', true],
        ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf', false],
        ['5afERTeXF8diWPy5P8AP2EkmcCFGkV9Z7LeSo9fpjcuf', true],
        ['TPpADS2avP3rKgUcjZgnQNw5oMhjW2J6Za', false],
    ])('isValidAddress(%s)', (address, result) => {
        expect(isValidAddress(address)).toBe(result)
    })
})
