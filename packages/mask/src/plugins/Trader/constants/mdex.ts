import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, USDC, USDT, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const MDEX_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const MDEX_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.BSC]: [WNATIVE, DAI, USDC, USDT].map((x) => x[ChainId.BSC]),
}
