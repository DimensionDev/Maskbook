import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, USDC, USDT, PAD, WBTC, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PADSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PADSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Moonbeam]: [WNATIVE, DAI, PAD, USDT, USDC, WBTC].map((x) => x[ChainId.Moonbeam]),
    [ChainId.BSC]: [WNATIVE, DAI, PAD, USDT, USDC, WBTC].map((x) => x[ChainId.BSC]),
}
