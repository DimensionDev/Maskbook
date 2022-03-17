import { DAI, USDC, fUSDT, WBTC, WNATIVE, WNATIVE_ONLY, ChainId } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const UBESWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const UBESWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC].map((x) => x[ChainId.Fantom]),
}
