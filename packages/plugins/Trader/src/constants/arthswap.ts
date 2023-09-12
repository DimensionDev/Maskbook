import { ChainId, USDC, USDT, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from '../types/index.js'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const ARTHSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ARTHSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT].map((x) => x[ChainId.Astar]),
}
