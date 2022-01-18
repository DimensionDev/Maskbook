import { ChainId } from '@masknet/web3-shared-evm'
import {
    DAI,
    RUNE,
    USDC,
    USDT,
    WBTC,
    WNATIVE,
    WNATIVE_ONLY,
    NFTX,
    STETH,
    BUSD,
    BTCB,
    CUSD,
    CEUR,
    mcEUR,
    mCELO,
    mCUSD,
    SOLAR,
    CBTC,
} from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SOLARBEAM_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SOLARBEAM_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT, WBTC, RUNE, NFTX, STETH].map((x) => x[ChainId.Mainnet]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC].map((x) => x[ChainId.xDai]),
    [ChainId.Celo]: [WNATIVE, CUSD, CEUR, CBTC, mcEUR, mCELO, mCUSD].map((x) => x[ChainId.Celo]),
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, WBTC].map((x) => x[ChainId.Fantom]),
    [ChainId.Moonriver]: [WNATIVE, DAI, USDC, SOLAR, BUSD].map((x) => x[ChainId.Moonriver]),
    // [ChainId.Avalanche]: [WNATIVE, DAI, USDT, WBTC].map((x) => x[ChainId.Avalanche]),
}
