import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    fetchCachedJSON: vi.fn(),
}))

vi.mock('../../src/helpers/fetchJSON.js', () => ({
    fetchCachedJSON: mocks.fetchCachedJSON,
}))

// The real helper pulls in the `@masknet/web3-providers/types` package alias, which
// does not resolve under vitest. Mirror its behavior instead.
vi.mock('../../src/Firefly/helpers.js', () => ({
    resolveFireflyResponseData: <T>({ data, error }: { data?: T; error?: string[] | string }) => {
        if (error) throw new Error(Array.isArray(error) ? error[0] : error)
        return data as T
    },
}))

const { getWalletPortfolioTotalValue } = await import('../../src/Firefly/Portfolio.js')

describe('getWalletPortfolioTotalValue', () => {
    beforeEach(() => {
        mocks.fetchCachedJSON.mockReset()
    })

    it('returns the numeric total and lowercases the address', async () => {
        mocks.fetchCachedJSON.mockResolvedValue({ code: 0, data: { total_assets: { usd_value: '26.66' } } })

        await expect(getWalletPortfolioTotalValue('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).resolves.toBe(26.66)
        expect(mocks.fetchCachedJSON).toHaveBeenCalledWith(
            'https://api.firefly.land/v1/wallet/portfolio/summary?address=0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        )
    })

    it('keeps a Solana base58 address as-is', async () => {
        mocks.fetchCachedJSON.mockResolvedValue({ code: 0, data: { total_assets: { usd_value: '1.5' } } })
        const solana = '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs'

        await expect(getWalletPortfolioTotalValue(solana)).resolves.toBe(1.5)
        expect(mocks.fetchCachedJSON).toHaveBeenCalledWith(
            `https://api.firefly.land/v1/wallet/portfolio/summary?address=${solana}`,
        )
    })

    it('throws when the total is missing or not numeric', async () => {
        mocks.fetchCachedJSON.mockResolvedValue({ code: 0, data: {} })
        await expect(getWalletPortfolioTotalValue('0x0000000000000000000000000000000000000001')).rejects.toThrow(
            'Invalid portfolio summary',
        )

        mocks.fetchCachedJSON.mockResolvedValue({ code: 0, data: { total_assets: { usd_value: '-' } } })
        await expect(getWalletPortfolioTotalValue('0x0000000000000000000000000000000000000001')).rejects.toThrow(
            'Invalid portfolio summary',
        )
    })

    it('throws when the backend reports an error', async () => {
        mocks.fetchCachedJSON.mockResolvedValue({ code: 1, error: ['boom'] })

        await expect(getWalletPortfolioTotalValue('0x0000000000000000000000000000000000000001')).rejects.toThrow('boom')
    })
})
