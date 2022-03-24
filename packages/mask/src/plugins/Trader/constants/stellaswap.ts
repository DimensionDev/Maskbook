import { DAI, USDC, STELLA, USDT, WBTC, WNATIVE, WNATIVE_ONLY, ChainId } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const STELLASWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const STELLASWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Moonbeam]: [WNATIVE, STELLA, DAI, USDT, USDC, WBTC].map((x) => x[ChainId.Moonbeam]),
}
