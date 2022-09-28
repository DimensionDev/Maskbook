import { describe, expect, test } from 'vitest'
import { MirrorPageType, getMirrorPageType, getMirrorUserId } from '../collecting/utils'

describe('test mirror collection utils', () => {
    test.each([
        { give: 'https://0xtest.mirror.xyz', expected: MirrorPageType.Profile },
        { give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a', expected: MirrorPageType.Profile },
        { give: 'https://mirror.xyz/test.eth', expected: MirrorPageType.Profile },
        { give: 'https://0xtest.mirror.xyz/collection/', expected: MirrorPageType.Collection },
        { give: 'https://0xtest.mirror.xyz/collection', expected: MirrorPageType.Collection },
        {
            give: 'https://mirror.xyz/0x790116d0685eB197B886DAcAD9C247f785987A4a/collection',
            expected: MirrorPageType.Collection,
        },
        { give: 'https://mirror.xyz/test.eth/collection', expected: MirrorPageType.Collection },
        {
            give: 'https://0xtest.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
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
        { give: 'https://0xtest.mirror.xyz', expected: '0xtest' },
        { give: 'https://0xtest.mirror.xyz/', expected: '0xtest' },
        { give: 'https://0xtest.mirror.xyz?p=test', expected: '0xtest' },
        { give: 'https://0xtest.mirror.xyz/collection', expected: '0xtest' },
        { give: 'https://0xtest.mirror.xyz/collection?p=test', expected: '0xtest' },
        {
            give: 'https://0xtest.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro',
            expected: '0xtest',
        },
        {
            give: 'https://0xtest.mirror.xyz/aCCyRXugL4y4UxvqXgcMcDwh6TiChEFTZ_BHtY1cbro?p=test',
            expected: '0xtest',
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
