import { describe, test, expect } from 'vitest'
import { formatDomainName } from '../../src/helpers/formatter.js'

describe('EVM formatter utilities', () => {
    test.each<{
        domain: string
        result: string
        resultOfCustomSize: string
    }>([
        {
            domain: 'short.eth',
            result: 'short.eth',
            resultOfCustomSize: 'short.eth',
        },
        {
            /* cspell:disable-next-line */
            domain: 'looooooooooooooooooong.eth',
            /* cspell:disable-next-line */
            result: 'looooooooooo...ng.eth',
            /* cspell:disable-next-line */
            resultOfCustomSize: 'looooooooo...ng.eth',
        },
    ])('formatDomainName', ({ domain, result, resultOfCustomSize }) => {
        expect(formatDomainName(domain)).toBe(result)
        expect(formatDomainName(domain, 16)).toBe(resultOfCustomSize)
    })
})
