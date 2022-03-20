import { ChainId, DAI, USDC, USDT, WBTC, WANNA, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const WANNASWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const WANNASWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Aurora]: [WNATIVE, WANNA, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Aurora]),
}
