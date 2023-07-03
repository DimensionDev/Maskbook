import { SourceType } from '@masknet/web3-shared-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as ChainId_Solana } from '@masknet/web3-shared-solana'
import type { Web3Helper } from '@masknet/web3-helpers'

export const CURRENCIES_MAP: Record<SourceType, undefined | TrendingAPI.Currency[]> = {
    [SourceType.CoinGecko]: [
        {
            id: 'usd',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [SourceType.CoinMarketCap]: [
        {
            id: '2781',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [SourceType.NFTScan]: [
        {
            id: 'eth',
            chainId: ChainId.Mainnet,
            name: '\u039E',
            symbol: '\u039E',
            description: 'Ethereum',
        },
        {
            id: 'Matic',
            chainId: ChainId.Matic,
            name: 'Matic',
            symbol: 'Matic',
            description: 'Matic',
        },
        {
            id: 'matic',
            chainId: ChainId.BSC,
            name: 'BNB',
            symbol: 'BNB',
            description: 'BNB',
        },
        {
            id: 'arbitrum',
            chainId: ChainId.Arbitrum,
            name: 'Arbitrum',
            symbol: 'Arbitrum',
            description: 'Arbitrum',
        },
        {
            id: 'solana',
            chainId: ChainId_Solana.Mainnet,
            name: '\u25CE',
            symbol: '\u25CE',
            description: 'Solana',
        },
        {
            id: 'optimism',
            chainId: ChainId.Optimism,
            name: 'Optimism',
            symbol: 'Optimism',
            description: 'Optimism',
        },
        {
            id: 'avalanche',
            chainId: ChainId.Avalanche,
            name: 'Avalanche',
            symbol: 'Avalanche',
            description: 'Avalanche',
        },
        {
            id: 'moonbeam',
            chainId: ChainId.Moonbeam,
            name: 'Moonbeam',
            symbol: 'Moonbeam',
            description: 'Moonbeam',
        },
    ],
    [SourceType.UniswapInfo]: undefined,
    [SourceType.X2Y2]: undefined,
    [SourceType.Chainbase]: undefined,
    [SourceType.Zerion]: undefined,
    [SourceType.Rarible]: undefined,
    [SourceType.OpenSea]: undefined,
    [SourceType.Alchemy_EVM]: undefined,
    [SourceType.LooksRare]: undefined,
    [SourceType.Zora]: undefined,
    [SourceType.Gem]: undefined,
    [SourceType.GoPlus]: undefined,
    [SourceType.Rabby]: undefined,
    [SourceType.Approval]: undefined,
    [SourceType.R2D2]: undefined,
    [SourceType.DeBank]: undefined,
    [SourceType.Flow]: undefined,
    [SourceType.Solana]: undefined,
    [SourceType.RSS3]: undefined,
    [SourceType.Alchemy_FLOW]: undefined,
    [SourceType.MagicEden]: undefined,
    [SourceType.Element]: undefined,
    [SourceType.Solsea]: undefined,
    [SourceType.Solanart]: undefined,
    [SourceType.RaritySniper]: undefined,
    [SourceType.TraitSniper]: undefined,
    [SourceType.CF]: undefined,
    [SourceType.OKX]: undefined,
    [SourceType.Uniswap]: undefined,
    [SourceType.NFTX]: undefined,
    [SourceType.Etherscan]: undefined,
    [SourceType.CryptoPunks]: undefined,
    [SourceType.SimpleHash]: undefined,
}

/**
 * TODO: support multiple currencies
 * @param dataProvider
 * @returns
 */
export function useCurrentCurrency(chainId: Web3Helper.ChainIdAll, dataProvider: SourceType | undefined) {
    if (!dataProvider) return undefined
    const currencies = CURRENCIES_MAP[dataProvider]
    if (!currencies) return
    return chainId && dataProvider === SourceType.NFTScan
        ? currencies.find((x) => x.chainId === chainId)
        : CURRENCIES_MAP[dataProvider]?.[0]
}
