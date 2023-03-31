import { describe, test, expect } from 'vitest'
import { getAssetFullName } from '../../src/helpers/getAssetFullName.js'

describe('getAssetFullName', () => {
    test.each([
        { address: '', contract: 'contract', name: '', tokenId: '', expected: 'contract' },
        { address: '', contract: '', name: '', tokenId: '123', expected: '#123' },

        { address: '', contract: 'contract', name: 'abc #123', tokenId: '123', expected: 'abc #123' },

        { address: '', contract: '', name: 'abc #123', tokenId: '', expected: 'abc #123' },

        { address: '', contract: 'contract', name: '#123', tokenId: '123', expected: 'contract #123' },
        { address: '', contract: '', name: '#123', tokenId: '123', expected: '#123' },
        { address: '', contract: 'contract', name: '#123', tokenId: '', expected: 'contract #123' },
        { address: '', contract: '', name: '#123', tokenId: '', expected: '#123' },

        {
            address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
            contract: 'abc',
            name: 'abc',
            tokenId: '123',
            expected: 'ENS #abc',
        },

        { address: '', contract: 'abc', name: 'abc', tokenId: '123', expected: 'abc #123' },
        { address: '', contract: 'contract', name: 'abc', tokenId: '123', expected: 'contract #abc' },

        { address: '', contract: '', name: 'abc', tokenId: '', expected: 'abc' },
        { address: '', contract: '', name: 'abc', tokenId: '123', expected: 'abc #123' },

        { address: '', contract: 'contract', name: 'abc', tokenId: '', expected: 'contract #abc' },
    ])('.getAssetFullName($address, $contract, $name, $tokenId)', ({ address, contract, name, tokenId, expected }) => {
        expect(getAssetFullName(address, contract, name, tokenId)).toBe(expected)
    })
})
