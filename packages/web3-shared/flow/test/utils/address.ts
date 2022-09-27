import { describe, test, expect } from 'vitest'
import { formatAddress, isValidAccountAddress, isValidContractAddress } from '../../src/utils/address.js'

describe('formatAddress', () => {
    test.each([
        { give: '0x329feb3ab062d289', expected: '0x329f...d289' },
        { give: 'A.329feb3ab062d289.NFT', expected: '0x329f...d289' },
        { give: 'NFT', expected: 'NFT' },
    ])('.formatAddress($give)', ({ give, expected }) => {
        expect(formatAddress(give)).toBe(expected)
    })
})

describe('isValidAccountAddress', () => {
    test.each([
        { give: '0x329feb3ab062d289', expected: true },
        { give: 'A.329feb3ab062d289.NFT', expected: false },
        { give: 'NFT', expected: false },
    ])('.isValidAccountAddress($give)', ({ give, expected }) => {
        expect(isValidAccountAddress(give)).toBe(expected)
    })
})

describe('isValidContractAddress', () => {
    test.each([
        { give: '0x329feb3ab062d289', expected: false },
        { give: 'A.329feb3ab062d289.NFT', expected: true },
        { give: 'NFT', expected: false },
    ])('.isValidContractAddress($give)', ({ give, expected }) => {
        expect(isValidContractAddress(give)).toBe(expected)
    })
})
