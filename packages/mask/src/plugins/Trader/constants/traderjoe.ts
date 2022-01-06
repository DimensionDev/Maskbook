import { ChainId } from '@masknet/web3-shared-evm'
import { ETHER, WNATIVE, WBTCe, DAIe, USDTe, USDCe, WNATIVE_ONLY } from './trader'

import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const TRADERJOE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const TRADERJOE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Avalanche]: [WNATIVE, DAIe, USDTe, USDCe, ETHER, WBTCe].map((x) => x[ChainId.Avalanche]),
}
