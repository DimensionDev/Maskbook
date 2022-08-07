import { ChainId, USDC, USDT, VERSA, BUSD, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const VERSA_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const VERSA_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT, BUSD, VERSA].map((x) => x[ChainId.Astar]),
}
