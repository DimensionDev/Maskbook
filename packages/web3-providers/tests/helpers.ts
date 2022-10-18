import { describe, test, expect } from 'vitest'
import { getNFTAllName, getNFTName } from '../src/helpers.js'

describe('helpers util test', () => {
    test.each([
        { name: '', tokenId: '', expected: '' },
        { name: 'abc', tokenId: '', expected: 'abc' },
        { name: 'abc #123', tokenId: '123', expected: 'abc' },
        { name: 'abc #123', tokenId: '', expected: 'abc' },
        { name: '#123', tokenId: '', expected: '' },
        { name: 'abc 123', tokenId: '123', expected: 'abc' },
    ])('.format($name)', ({ name, tokenId, expected }) => {
        expect(getNFTName(name, tokenId)).toBe(expected)
    })
})

describe('helpers util test', () => {
    test.each([
        { contract: 'contract', name: '', tokenId: '', expected: 'contract' },
        { contract: 'contract', name: '', tokenId: '123', expected: 'contract #123' },
        { contract: '', name: '', tokenId: '123', expected: '' },
        { contract: 'contract', name: 'abc', tokenId: '', expected: 'contract #abc' },
        { contract: 'contract', name: 'abc #123', tokenId: '123', expected: 'contract #abc' },
        { contract: 'contract', name: 'abc #123', tokenId: '', expected: 'contract #abc' },
        { contract: 'contract', name: 'abc 123', tokenId: '123', expected: 'contract #abc' },
        { contract: 'contract', name: 'abc.eth', tokenId: '123', expected: 'ENS #abc.eth' },
        { contract: 'abc', name: 'abc', tokenId: '', expected: '#abc' },
    ])('.format($name)', ({ contract, name, tokenId, expected }) => {
        expect(getNFTAllName(contract, name, tokenId)).toBe(expected)
    })
})
