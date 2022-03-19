import { ChainId, DAI, USDC, fUSDT, WBTC, WNATIVE, WNATIVE_ONLY, BOO } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SPOOKYSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SPOOKYSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC, BOO].map((x) => x[ChainId.Fantom]),
}
