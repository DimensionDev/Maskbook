import { describe, test, expect } from 'vitest'
import { getNFTName } from '../src/helpers.js'

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
