import type { NextIDPersonaBindings } from '@masknet/shared-base'
import { describe, expect, test } from 'vitest'
import { getLatestBinding } from '../utils/index.js'

// cspell:ignore wen6666661, wenwenlol
// https://twitter.com/WEN6666661
const mockBindings = [
    {
        persona: '0x020dd9f2757608704b8f497c8a7eaca83edc9f054213e6fd87ec4afab65901acb0',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1664259931',
                last_checked_at: '1665468563',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03d7bdf6f21cd12382e2f34d82a1b7e9191bdfe04d6714b0023622fe2d9a54c294',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1663902673',
                last_checked_at: '1665457162',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03e681b185f2f492b5124494a74902b497618670096858851a4c423d04a4a98faf',
        proofs: [
            {
                platform: 'ethereum',
                identity: '0x790116d0685eb197b886dacad9c247f785987a4a',
                created_at: '1662534061',
                last_checked_at: '1665333069',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1662534046',
                last_checked_at: '1665457161',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x020876be4f8daf9287149e90f24215051536ecc51cbc06dfd66c4a5654e2df1623',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1660551314',
                last_checked_at: '1665471872',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03fdbb373bd3587a02d802911b9c9b55bbd86f8fab00e75789ea9dfba3bf489e8e',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1660546176',
                last_checked_at: '1665457161',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03fb6124c61c651469c3c3646c43caa4bf596128871599949208c61dfcd308c1ad',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1658332938',
                last_checked_at: '1665484763',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03e3f89321bb0c268a407ac9175ee271a73f3ce2496043c9c54d9be65bbe9b98f5',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1652778867',
                last_checked_at: '1665457161',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'ethereum',
                identity: '0x790116d0685eb197b886dacad9c247f785987a4a',
                created_at: '1652778936',
                last_checked_at: '1652778936',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x024ff6709b41bdf386c5f434dba8a5e900fcf6a31727b06627d188d36a3ee02e45',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1652757587',
                last_checked_at: '1665457161',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'ethereum',
                identity: '0x790116d0685eb197b886dacad9c247f785987a4a',
                created_at: '1652757634',
                last_checked_at: '1652757634',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x0314aa8fafb1a8d99fb0729af68c1bdae76d4ad99a69d987cf025bd58201faa25f',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1652710154',
                last_checked_at: '1665457161',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'ethereum',
                identity: '0x790116d0685eb197b886dacad9c247f785987a4a',
                created_at: '1652710302',
                last_checked_at: '1652710302',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x03ec3d5702bc07a007cb05679e95a17470de6826d669a6713832d0ee978738f2ae',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wenwenlol',
                created_at: '1652709261',
                last_checked_at: '1665560054',
                is_valid: false,
                invalid_reason:
                    'Error when getting tweet 1526199366595510272: twitter: 144 No status found with that ID.',
            },
            {
                platform: 'ethereum',
                identity: '0xd5c2c5f2e10802846bbd86c5fd8438b7ca4ff83a',
                created_at: '1652709355',
                last_checked_at: '1652709355',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1652709736',
                last_checked_at: '1665482824',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x036c983cd021fd2b796c5f2a476c3bc81fdab9bb87012acc914e321b04944cc3e3',
        proofs: [
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1652297896',
                last_checked_at: '1665482824',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
    {
        persona: '0x02f582e191ae89c6cd1b612459786b214b71d242ca45c3cf4f2af710a4d520ab16',
        proofs: [
            {
                platform: 'ethereum',
                identity: '0x790116d0685eb197b886dacad9c247f785987a4a',
                created_at: '1662362984',
                last_checked_at: '1665333069',
                is_valid: true,
                invalid_reason: '',
            },
            {
                platform: 'twitter',
                identity: 'wen6666661',
                created_at: '1650480773',
                last_checked_at: '1665469909',
                is_valid: true,
                invalid_reason: '',
            },
        ],
    },
] as NextIDPersonaBindings[]

describe('usePublicWallets', () => {
    test('getLatestBinding()', () => {
        const latestBinding = getLatestBinding(mockBindings)
        expect(latestBinding.persona).toEqual('0x020dd9f2757608704b8f497c8a7eaca83edc9f054213e6fd87ec4afab65901acb0')
    })
})
