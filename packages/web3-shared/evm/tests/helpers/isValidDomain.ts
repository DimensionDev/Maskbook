import { describe, test, expect } from 'vitest'
import { isValidDomain } from '../../src/helpers/isValidDomain.js'

describe('isValidDomain', () => {
    test.each([
        /* cspell:disable */
        ['sujiyan.eth', true],
        ['[4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0].sujiyan.eth', true],
        ['[4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0].eth', false],
        /* cspell:enable */
    ])('formatDomainName', (domain, result) => {
        expect(isValidDomain(domain)).toBe(result)
    })
})
