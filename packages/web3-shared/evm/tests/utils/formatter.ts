import { describe, test, expect } from 'vitest'
import { formatDomainName } from '../../src/utils/formatter.js'

describe('EVM formatter utilities', () => {
    test.each<{
        domain: string
        result: string
    }>([
        {
            domain: 'short.eth',
            result: 'short.eth',
        },
        {
            /* cspell:disable-next-line */
            domain: 'looooooooooooooooooong.eth',
            /* cspell:disable-next-line */
            result: 'looooooooooo...ng.eth',
        },
    ])('formatDomainName', ({ domain, result }) => {
        expect(formatDomainName(domain)).toBe(result)
    })
})
