import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    fetchJSON: vi.fn(),
}))

vi.mock('../../src/helpers/fetchJSON.js', () => ({
    fetchJSON: mocks.fetchJSON,
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
        mocks.fetchJSON.mockReset()
    })

    it('returns the numeric total and lowercases the address', async () => {
        mocks.fetchJSON.mockResolvedValue({ code: 0, data: { total_assets: { usd_value: '26.66' } } })

        await expect(getWalletPortfolioTotalValue('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).resolves.toBe(26.66)
        expect(mocks.fetchJSON).toHaveBeenCalledWith(
            'https://api.firefly.land/v1/wallet/portfolio/summary?address=0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        )
    })

    it('throws when the backend reports an error', async () => {
        mocks.fetchJSON.mockResolvedValue({ code: 1, error: ['boom'] })

        await expect(getWalletPortfolioTotalValue('0x0000000000000000000000000000000000000001')).rejects.toThrow('boom')
    })
})
