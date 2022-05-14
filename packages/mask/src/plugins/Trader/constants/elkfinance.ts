import {
    ChainId,
    DAI,
    RUNE,
    USDC,
    USDT,
    fUSDT,
    WBTC,
    WNATIVE,
    WNATIVE_ONLY,
    NFTX,
    STETH,
    BUSD,
    BTCB,
    ELK,
} from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const ELKFINANCE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ELKFINANCE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT, WBTC, RUNE, NFTX, STETH, ELK].map((x) => x[ChainId.Mainnet]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT, ELK].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB, ELK].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC, ELK].map((x) => x[ChainId.xDai]),
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC, ELK].map((x) => x[ChainId.Fantom]),
    [ChainId.Avalanche]: [WNATIVE, DAI, USDC, WBTC, USDT, ELK].map((x) => x[ChainId.Avalanche]),
    [ChainId.Harmony]: [WNATIVE, DAI, USDC, WBTC, USDT, ELK].map((x) => x[ChainId.Harmony]),
    [ChainId.Optimistic]: [WNATIVE, DAI, USDC, WBTC, USDT, ELK].map((x) => x[ChainId.Optimistic]),
    [ChainId.Arbitrum]: [WNATIVE, DAI, USDC, WBTC, USDT, ELK].map((x) => x[ChainId.Arbitrum]),
}
