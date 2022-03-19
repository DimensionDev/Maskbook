import {
    ChainId,
    DAI,
    MSKA,
    MSKB,
    MSKC,
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
    CUSD,
    CEUR,
} from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SUSHISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SUSHISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT, WBTC, RUNE, NFTX, STETH].map((x) => x[ChainId.Mainnet]),
    [ChainId.Rinkeby]: [WNATIVE, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC].map((x) => x[ChainId.xDai]),
    [ChainId.Celo]: [WNATIVE, CUSD, CEUR].map((x) => x[ChainId.Celo]),
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC].map((x) => x[ChainId.Fantom]),
    [ChainId.Moonriver]: [WNATIVE, DAI, USDC, WBTC].map((x) => x[ChainId.Moonriver]),
    [ChainId.Avalanche]: [WNATIVE, DAI, USDC, WBTC, USDT].map((x) => x[ChainId.Avalanche]),
}
