import { describe, expect, test } from 'vitest'
import { resolveNonFungibleTokenIdFromEnsDomain } from '../../src/helpers/resolveNonFungibleTokenIdFromEnsDomain.js'

describe('resolveNonFungibleTokenIdFromEnsDomain', () => {
    test('resolve token Id', () => {
        const tokenId = resolveNonFungibleTokenIdFromEnsDomain('suji.eth')
        expect(tokenId).toBe('110200447707045993883781848952287804962082606868111919272648820269784364740013')
    })
})
