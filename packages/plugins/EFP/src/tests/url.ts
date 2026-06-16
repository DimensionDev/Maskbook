import { describe, expect, it } from 'vitest'
import { EFP_PROFILE_URL_PATTERN } from '../constants.js'
import { parseEFPProfileLink } from '../helpers/url.js'

describe('EFP profile links', () => {
    it.each([
        ['ethfollow.xyz/vitalik.eth', { user: 'vitalik.eth', type: 'user', topEight: false }],
        [
            'https://efp.app/0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
            { user: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', type: 'user', topEight: false },
        ],
        ['https://ethfollow.xyz/6509', { user: '6509', type: 'list', topEight: false }],
        ['https://efp.app/vitalik.eth?topEight=true', { user: 'vitalik.eth', type: 'user', topEight: true }],
        // X rewrites protocol-less links into http:// t.co redirect targets, so links resolved
        // from t.co cards arrive with the http protocol.
        ['http://ethfollow.xyz/6509', { user: '6509', type: 'list', topEight: false }],
        ['http://efp.app/vitalik.eth', { user: 'vitalik.eth', type: 'user', topEight: false }],
    ] as const)('parses %s', (link, expected) => {
        const result = parseEFPProfileLink(link)

        expect(result).toMatchObject(expected)
        expect(result?.profileUrl).toContain(`/${expected.user}`)
    })

    it.each([
        'https://ethfollow.xyz/api',
        'https://efp.app/og?user=vitalik.eth',
        'https://efp.app/assets/logo.svg',
        'https://efp.app/leaderboard',
        'https://efp.app/integrations',
        'https://efp.app/team',
        'https://efp.app/swipe',
        'https://ethfollow.xyz/vitalik.eth/followers',
        'https://example.com/vitalik.eth',
        'https://efp.app/not a valid name',
        'https://efp.app/not..valid.eth',
        'https://efp.app/vitalik.eth?topEight=false',
        'https://efp.app/vitalik.eth?foo=bar',
        'https://efp.app/vitalik.eth#profile',
        'ftp://efp.app/vitalik.eth',
    ])('rejects %s', (link) => {
        expect(parseEFPProfileLink(link)).toBeNull()
    })

    it.each([
        'https://ethfollow.xyz/vitalik.eth',
        'https://efp.app/0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        'https://ethfollow.xyz/6509',
        'https://efp.app/vitalik.eth?topEight=true',
        'http://ethfollow.xyz/6509',
    ])('contribution pattern matches %s', (link) => {
        expect(EFP_PROFILE_URL_PATTERN.test(link)).toBe(true)
    })

    it.each([
        'https://efp.app/api',
        'https://efp.app/og?user=vitalik.eth',
        'https://efp.app/vitalik.eth/followers',
        'https://efp.app/not a valid name',
        'https://efp.app/not..valid.eth',
        'https://efp.app/vitalik.eth?topEight=false',
        'https://efp.app/vitalik.eth#profile',
    ])('contribution pattern rejects %s', (link) => {
        expect(EFP_PROFILE_URL_PATTERN.test(link)).toBe(false)
    })
})
