import { ChainId, DAI, USDC, USDT, WBTC, WNATIVE, OPENX, WNATIVE_ONLY } from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const OPENSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const OPENSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Harmony]: [WNATIVE, DAI, OPENX, USDC, WBTC, USDT].map((x) => x[ChainId.Harmony]),
}
