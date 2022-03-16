import { ChainId, WNATIVE, WNATIVE_ONLY, CUSD, CEUR, UBE } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const UBESWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const UBESWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Celo]: [WNATIVE, CUSD, CEUR, UBE].map((x) => x[ChainId.Celo]),
}
