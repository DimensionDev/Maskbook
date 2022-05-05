import { ChainId, DAI, USDC, USDT, WBTC, EMO, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const EVMOSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const EVMOSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Evmos]: [WNATIVE, DAI, USDC, WBTC, USDT, EMO].map((x) => x[ChainId.Evmos]),
}
