import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    fetchCachedJSON: vi.fn(),
}))

vi.mock('../../src/helpers/fetchJSON.js', () => ({
    fetchCachedJSON: mocks.fetchCachedJSON,
}))

const { DeBankFungibleToken } = await import('../../src/DeBank/apis/FungibleTokenAPI.js')

describe('DeBankFungibleToken.getAssets', () => {
    beforeEach(() => {
        mocks.fetchCachedJSON.mockReset()
    })

    it('returns undefined for a missing upstream response so another provider can be attempted', async () => {
        mocks.fetchCachedJSON.mockResolvedValue(undefined)

        await expect(
            DeBankFungibleToken.getAssets('0x0000000000000000000000000000000000000001'),
        ).resolves.toBeUndefined()
    })

    it('keeps a valid empty response distinct from an upstream failure', async () => {
        mocks.fetchCachedJSON.mockResolvedValue([])

        await expect(DeBankFungibleToken.getAssets('0x0000000000000000000000000000000000000001')).resolves.toBeDefined()
    })
})
