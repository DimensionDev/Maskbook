import { describe, expect, test } from 'vitest'
import { MirrorPageType, getMirrorPageType, getMirrorUserId } from '../collecting/utils.js'

describe('test mirror collection utils', () => {
    test.each([
        { give: 'https://test_ens.mirror.xyz', expected: MirrorPageType.Profile },
        { give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a', expected: MirrorPageType.Profile },
        { give: 'https://mirror.xyz/test.eth', expected: MirrorPageType.Profile },
        { give: 'https://test_ens.mirror.xyz/collection/', expected: MirrorPageType.Collection },
        { give: 'https://test_ens.mirror.xyz/collection', expected: MirrorPageType.Collection },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/collection',
            expected: MirrorPageType.Collection,
        },
        { give: 'https://mirror.xyz/test.eth/collection', expected: MirrorPageType.Collection },
        {
            give: 'https://test_ens.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: MirrorPageType.Post,
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: MirrorPageType.Post,
        },
        {
            give: 'https://mirror.xyz/test.eth/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: MirrorPageType.Post,
        },
        {
            give: 'https://mirror.xyz/dashboard/',
            expected: MirrorPageType.Dashboard,
        },
    ])('.getMirrorPageType($give)', ({ give, expected }) => {
        expect(getMirrorPageType(give)).toBe(expected)
    })
})

describe('should get mirror id', () => {
    test.each([
        // mirror ens
        { give: 'https://test_ens.mirror.xyz', expected: 'test_ens.eth' },
        { give: 'https://test_ens.mirror.xyz/', expected: 'test_ens.eth' },
        { give: 'https://test_ens.mirror.xyz?p=test', expected: 'test_ens.eth' },
        { give: 'https://test_ens.mirror.xyz/collection', expected: 'test_ens.eth' },
        { give: 'https://test_ens.mirror.xyz/collection?p=test', expected: 'test_ens.eth' },
        {
            give: 'https://test_ens.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: 'test_ens.eth',
        },
        {
            give: 'https://test_ens.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro?p=test',
            expected: 'test_ens.eth',
        },
        // user ens
        { give: 'https://mirror.xyz/test.eth', expected: 'test.eth' },
        { give: 'https://mirror.xyz/test.eth/', expected: 'test.eth' },
        { give: 'https://mirror.xyz/test.eth?p=test', expected: 'test.eth' },
        { give: 'https://mirror.xyz/test.eth/collection', expected: 'test.eth' },
        { give: 'https://mirror.xyz/test.eth/collection?p=test', expected: 'test.eth' },
        {
            give: 'https://mirror.xyz/test.eth/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: 'test.eth',
        },
        {
            give: 'https://mirror.xyz/test.eth/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro?p=test',
            expected: 'test.eth',
        },

        // address
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a?p=test',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/collection',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/collection?p=test',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro?p=test',
            expected: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
        },
    ])('.getMirrorUserId($give)', ({ give, expected }) => {
        expect(getMirrorUserId(give)).toBe(expected)
    })
})
