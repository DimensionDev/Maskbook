import { ChainId } from '@masknet/web3-shared'
import { BTCB, BUSD, DAI, ETHER, UST, WETH, WETH_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PANCAKESWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PANCAKESWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WETH_ONLY,
    [ChainId.BSC]: [WETH, DAI, BUSD, BTCB, UST, ETHER].map((x) => x[ChainId.BSC]),
}
