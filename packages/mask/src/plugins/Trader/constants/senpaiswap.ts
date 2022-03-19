import { ChainId, USDC, USDT, WBTC, WNATIVE, SENPAI, BOBA, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SENPAISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SENPAISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Boba]: [WNATIVE, USDC, USDT, WBTC, SENPAI, BOBA].map((x) => x[ChainId.Boba]),
}
