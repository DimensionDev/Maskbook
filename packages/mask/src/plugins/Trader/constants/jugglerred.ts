import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const JUGGLERRED_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const JUGGLERRED_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Optimistic]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Optimistic]),
    [ChainId.Optimistic_Kovan]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Optimistic_Kovan]),
}
