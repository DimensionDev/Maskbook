import { describe, test, expect } from 'vitest'
import { formatDomainName } from '../src/utils/formatter'

describe('EVM formatter utilities', () => {
    test.each<{ domain: string; result: string }>([
        {
            domain: 'short.eth',
            result: 'short.eth',
        },
        {
            domain: 'looooooooooooooooooong.eth',
            result: 'looooooooooo...ng.eth',
        },
    ])('formatDomainName', ({ domain, result }) => {
        expect(formatDomainName(domain)).toBe(result)
    })
})
