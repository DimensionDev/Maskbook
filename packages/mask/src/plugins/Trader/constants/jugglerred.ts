import { ChainId, DAI, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const JUGGLERRED_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const JUGGLERRED_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Optimism]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Optimism]),
    [ChainId.Optimism_Kovan]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Optimism_Kovan]),
}
