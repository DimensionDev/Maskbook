import { ChainId } from '@masknet/web3-shared-evm'
import {
    DAI,
    MSKA,
    MSKB,
    MSKC,
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
    SUSHI,
} from './trader'
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
    [ChainId.Fantom]: [WNATIVE, USDC, WBTC, DAI, SUSHI].map((x) => x[ChainId.Fantom]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC].map((x) => x[ChainId.xDai]),
    [ChainId.Celo]: [WNATIVE, CUSD, CEUR].map((x) => x[ChainId.Celo]),
}
