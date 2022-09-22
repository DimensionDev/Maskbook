import { describe, expect, test } from 'vitest'
import { MirrorPageType, mirrorPageProbe } from '../collecting/utils'

const cases = []

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
    ])('.pageProbe($give)', ({ give, expected }) => {
        expect(mirrorPageProbe(give)).toBe(expected)
    })
})
