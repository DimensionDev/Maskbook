import { ChainId } from '@masknet/web3-shared-evm'
import { USDC, USDT, TETHYS, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const TETHYS_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const TETHYS_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Metis]: [WNATIVE, USDC, USDT, TETHYS].map((x) => x[ChainId.Metis]),
}
