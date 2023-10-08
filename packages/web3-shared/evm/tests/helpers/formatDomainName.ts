import { describe, test, expect } from 'vitest'
import { formatDomainName } from '../../src/helpers/formatter.js'

describe('EVM formatter utilities', () => {
    test.each<{
        domain: string
        result: string
        resultOfCustomSize: string
    }>([
        /* cspell:disable */
        {
            domain: 'short.eth',
            result: 'short.eth',
            resultOfCustomSize: 'short.eth',
        },
        {
            domain: 'looooooooooooooooooong.eth',
            result: 'looooooooooo...ng.eth',
            resultOfCustomSize: 'looooooooo...ng.eth',
        },
        {
            domain: '[9db67de1a578d6d3cfd09fbe15c526cc206d723f4f02b4dad5fdb852fa42b747].maskxx.eth',
            result: '[9db6...b747].maskxx.eth',
            resultOfCustomSize: '[9db6...b747].maskxx.eth',
        },
        /* cspell:enable */
    ])('formatDomainName', ({ domain, result, resultOfCustomSize }) => {
        expect(formatDomainName(domain)).toBe(result)
        expect(formatDomainName(domain, 16)).toBe(resultOfCustomSize)
    })
})
