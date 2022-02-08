import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, USDC, USDT, WBTC, SMOL, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const CRONASWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const CRONASWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Cronos]: [WNATIVE, SMOL, DAI, USDT, USDC, WBTC].map((x) => x[ChainId.Cronos]),
}
