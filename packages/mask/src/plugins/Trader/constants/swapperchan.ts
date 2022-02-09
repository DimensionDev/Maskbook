import { ChainId } from '@masknet/web3-shared-evm'
import { USDC, USDT, WBTC, WNATIVE, WAIFU, BOBA, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SWAPPERCHAN_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SWAPPERCHAN_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Boba]: [WNATIVE, USDC, USDT, WBTC, WAIFU, BOBA].map((x) => x[ChainId.Boba]),
}
