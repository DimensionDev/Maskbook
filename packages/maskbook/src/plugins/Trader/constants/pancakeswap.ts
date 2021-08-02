import { ChainId } from '@masknet/web3-shared'
import { BTCB, BUSD, DAI, ETHER, UST, WETH, WETH_ONLY } from './trader'
import type { AgainstToken, CustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PANCAKESWAP_CUSTOM_BASES: CustomizedBase = {}

export const PANCAKESWAP_BASE_AGAINST_TOKENS: AgainstToken = {
    ...WETH_ONLY,
    [ChainId.BSC]: [WETH, DAI, BUSD, BTCB, UST, ETHER].map((x) => x[ChainId.BSC]),
}
