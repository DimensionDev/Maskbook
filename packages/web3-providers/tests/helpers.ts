import { describe, test, expect } from 'vitest'
import { getAssetFullName } from '../src/helpers.js'

describe('helpers util test', () => {
    test.each([
        { contract: 'contract', name: '', tokenId: '', expected: 'contract' },
        { contract: '', name: '', tokenId: '123', expected: '#123' },

        { contract: 'contract', name: 'abc #123', tokenId: '123', expected: 'abc #123' },

        { contract: '', name: 'abc #123', tokenId: '', expected: 'abc #123' },
        { contract: 'contract', name: 'abc.eth', tokenId: '', expected: 'ENS #abc.eth' },
        { contract: '', name: 'abc.eth', tokenId: '123', expected: 'ENS #abc.eth' },

        { contract: 'contract', name: '#123', tokenId: '123', expected: 'contract #123' },
        { contract: '', name: '#123', tokenId: '123', expected: '#123' },
        { contract: 'contract', name: '#123', tokenId: '', expected: 'contract #123' },
        { contract: '', name: '#123', tokenId: '', expected: '#123' },

        { contract: 'abc', name: 'abc', tokenId: '123', expected: 'abc #123' },
        { contract: 'contract', name: 'abc', tokenId: '123', expected: 'contract #abc' },

        { contract: '', name: 'abc', tokenId: '', expected: 'abc' },
        { contract: '', name: 'abc', tokenId: '123', expected: 'abc #123' },

        { contract: 'contract', name: 'abc', tokenId: '', expected: 'contract #abc' },
    ])('.format($name)', ({ contract, name, tokenId, expected }) => {
        expect(getAssetFullName(contract, name, tokenId)).toBe(expected)
    })
})
