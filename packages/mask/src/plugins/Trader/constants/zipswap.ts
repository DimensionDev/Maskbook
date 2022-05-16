import { ChainId, DAI, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY, ZIP } from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const ZIPSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ZIPSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Optimism]: [WNATIVE, DAI, USDC, WBTC, USDT, ZIP].map((x) => x[ChainId.Optimism]),
    [ChainId.Arbitrum]: [WNATIVE, DAI, USDC, WBTC, USDT, ZIP].map((x) => x[ChainId.Arbitrum]),
}
