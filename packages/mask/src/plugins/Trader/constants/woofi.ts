import {
    ChainId,
    USDC,
    USDT,
    WBTC,
    WNATIVE,
    WNATIVE_ONLY,
    BTCB,
    ETHER,
    NetworkType,
    WOO,
} from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

export const WOOFI_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const woofiNetworkNames: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: '',
    [NetworkType.Binance]: 'bsc',
    [NetworkType.Polygon]: '',
    [NetworkType.Arbitrum]: '',
    [NetworkType.xDai]: '',
    [NetworkType.Celo]: '',
    [NetworkType.Fantom]: 'fantom',
    [NetworkType.Avalanche]: 'avax',
    [NetworkType.Aurora]: '',
    [NetworkType.Boba]: '',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Optimistic]: '',
    [NetworkType.Conflux]: '',
}

export const WOOFI_BASE_URL = 'https://fi-api.woo.org/'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const WOOFI_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const WOOFI_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.BSC]: [WNATIVE, BTCB, ETHER, WOO, USDT].map((x) => x[ChainId.BSC]),
    [ChainId.Avalanche]: [WNATIVE, WBTC, ETHER, WOO, USDT].map((x) => x[ChainId.Avalanche]),
    [ChainId.Fantom]: [WNATIVE, WBTC, ETHER, WOO, USDC].map((x) => x[ChainId.Fantom]),
}
