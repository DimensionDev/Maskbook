import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CurrencyType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

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

const { FireflyFungibleToken } = await import('../../src/Firefly/WalletAssets.js')

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

function mockList(list: unknown[]) {
    mocks.fetchCachedJSON.mockResolvedValue({ code: 0, data: { list } })
}

describe('FireflyFungibleToken.getAssets', () => {
    beforeEach(() => {
        mocks.fetchCachedJSON.mockReset()
    })

    it('requests the token list from the Firefly backend with a lowercased address', async () => {
        mockList([])

        await FireflyFungibleToken.getAssets(ADDRESS)
        expect(mocks.fetchCachedJSON).toHaveBeenCalledWith(
            'https://api.firefly.land/v1/misc/all_token_list?address=0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
            undefined,
            { cacheDuration: 10_000 },
        )
    })

    it('returns undefined for a missing upstream response so another provider can be attempted', async () => {
        mocks.fetchCachedJSON.mockResolvedValue(undefined)

        await expect(FireflyFungibleToken.getAssets(ADDRESS)).resolves.toBeUndefined()
    })

    it('keeps a valid empty response distinct from an upstream failure', async () => {
        mockList([])

        await expect(FireflyFungibleToken.getAssets(ADDRESS)).resolves.toBeDefined()
    })

    it('maps an ERC-20 record with community_id to the builtin chain', async () => {
        mockList([
            {
                id: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
                chain: 'binance-smart-chain',
                community_id: '56',
                name: 'PancakeSwap Token',
                symbol: 'CAKE',
                decimals: 18,
                logo_url: 'https://cdn.zerion.io/cake.png',
                price: 2.5,
                amount: 4,
                is_verified: false,
            },
        ])

        const pageable = await FireflyFungibleToken.getAssets(ADDRESS)
        const cake = pageable!.data.find((x) => x.symbol === 'CAKE')!

        expect(cake.chainId).toBe(ChainId.BSC)
        expect(cake.address).toBe('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')
        expect(cake.schema).toBe(SchemaType.ERC20)
        expect(cake.balance).toBe('4000000000000000000')
        expect(cake.price?.[CurrencyType.USD]).toBe('2.5')
        expect(cake.value?.[CurrencyType.USD]).toBe('10')
        expect(cake.logoURL).toBe('https://cdn.zerion.io/cake.png')
    })

    it('maps a native record (id === chain) to the native schema and address', async () => {
        mockList([
            {
                id: 'ethereum',
                chain: 'ethereum',
                community_id: '1',
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                logo_url: 'https://cdn.zerion.io/eth.png',
                price: 3000,
                amount: 1.5,
                is_verified: true,
            },
        ])

        const pageable = await FireflyFungibleToken.getAssets(ADDRESS)
        const eth = pageable!.data.find((x) => x.chainId === ChainId.Mainnet)!

        expect(eth.schema).toBe(SchemaType.Native)
        expect(eth.address).toBe(ZERO_ADDRESS)
        expect(eth.balance).toBe('1500000000000000000')
        expect(eth.value?.[CurrencyType.USD]).toBe('4500')
    })

    it('drops records with an unknown or non-EVM community_id', async () => {
        mockList([
            {
                id: '0x0000000000000000000000000000000000000001',
                chain: 'solana',
                community_id: '101',
                name: 'Solana wrapped',
                symbol: 'SOLW',
                decimals: 9,
                logo_url: null,
                price: null,
                amount: 1,
            },
            {
                id: '0x0000000000000000000000000000000000000002',
                chain: 'unknown',
                community_id: '',
                name: 'Unknown chain token',
                symbol: 'UNK',
                decimals: 18,
                logo_url: null,
                price: null,
                amount: 1,
            },
        ])

        const pageable = await FireflyFungibleToken.getAssets(ADDRESS)
        expect(pageable!.data.filter((x) => ['SOLW', 'UNK'].includes(x.symbol))).toEqual([])
    })

    it('keeps unverified records so real holdings are not hidden', async () => {
        mockList([
            {
                id: '0x28561b8a2360f463011c16b6cc0b0cbef8dbbcad',
                chain: 'ethereum',
                community_id: '1',
                name: 'MOO DENG',
                symbol: 'MOODENG',
                decimals: 18,
                logo_url: null,
                price: 0.000002,
                amount: 30_000_000,
                is_verified: false,
            },
        ])

        const pageable = await FireflyFungibleToken.getAssets(ADDRESS)
        expect(pageable!.data.some((x) => x.symbol === 'MOODENG')).toBe(true)
    })

    it('truncates float noise so balances stay integers and strips the (PoS) suffix', async () => {
        mockList([
            {
                id: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                chain: 'polygon',
                community_id: '137',
                name: 'USD Coin (PoS)',
                symbol: 'USDC',
                decimals: 6,
                logo_url: null,
                price: 1,
                amount: 0.30000000000000004,
            },
        ])

        const pageable = await FireflyFungibleToken.getAssets(ADDRESS)
        const usdc = pageable!.data.find((x) => x.symbol === 'USDC')!
        expect(usdc.balance).toBe('300000')
        expect(usdc.name).toBe('USD Coin')
    })
})
