import { ChainId } from '@masknet/web3-shared'
import { COMP, DAI, MKR, USDC, USDT, WETH, WETH_ONLY } from './trader'
import type { AgainstToken, CustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SASHIMISWAP_CUSTOM_BASES: CustomizedBase = {}

export const SASHIMISWAP_BASE_AGAINST_TOKENS: AgainstToken = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [WETH, DAI, USDC, USDT, COMP, MKR].map((x) => x[ChainId.Mainnet]),
}
