import { describe, test, expect } from 'vitest'
import { getAssetFullName } from '../src/helpers.js'

describe('helpers util test', () => {
    test.each([
        { address: '', contract: 'contract', name: '', tokenId: '', expected: 'contract' },
        { address: '', contract: '', name: '', tokenId: '123', expected: '#123' },

        { address: '', contract: 'contract', name: 'abc #123', tokenId: '123', expected: 'abc #123' },

        { address: '', contract: '', name: 'abc #123', tokenId: '', expected: 'abc #123' },
        { address: '', contract: 'contract', name: 'abc.eth', tokenId: '', expected: 'ENS #abc.eth' },
        { address: '', contract: '', name: 'abc.eth', tokenId: '123', expected: 'ENS #abc.eth' },

        { address: '', contract: 'contract', name: '#123', tokenId: '123', expected: 'contract #123' },
        { address: '', contract: '', name: '#123', tokenId: '123', expected: '#123' },
        { address: '', contract: 'contract', name: '#123', tokenId: '', expected: 'contract #123' },
        { address: '', contract: '', name: '#123', tokenId: '', expected: '#123' },

        { address: '', contract: 'abc', name: 'abc', tokenId: '123', expected: 'abc #123' },
        { address: '', contract: 'contract', name: 'abc', tokenId: '123', expected: 'contract #abc' },

        { address: '', contract: '', name: 'abc', tokenId: '', expected: 'abc' },
        { address: '', contract: '', name: 'abc', tokenId: '123', expected: 'abc #123' },

        { address: '', contract: 'contract', name: 'abc', tokenId: '', expected: 'contract #abc' },
    ])('.format($name)', ({ address, contract, name, tokenId, expected }) => {
        expect(getAssetFullName(address, contract, name, tokenId)).toBe(expected)
    })
})
