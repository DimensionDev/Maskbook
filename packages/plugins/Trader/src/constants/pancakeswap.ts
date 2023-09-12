import { ChainId, BTCB, BUSD, DAI, ETHER, UST, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from '@masknet/web3-providers/types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PANCAKESWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PANCAKESWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, BTCB, UST, ETHER].map((x) => x[ChainId.BSC]),
}
