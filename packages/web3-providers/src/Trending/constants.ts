import { SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import type { TrendingAPI } from '../entry-types.js'

// the size of coins to recommend when users search a keyword
export const COIN_RECOMMENDATION_SIZE = 10

// all coins stay after the valid top rank will be ignored.
export const VALID_TOP_RANK = 5000

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
            chainId: SolanaChainId.Mainnet,
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
