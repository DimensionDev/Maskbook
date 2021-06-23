import { ChainId, ERC20TokenDetailed } from '@masknet/web3-shared'
import { WETH_ONLY, WETH, DAI, BUSD, UST, BTCB, ETHER } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PANCAKESWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {}

export const PANCAKESWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.BSC]: [WETH, DAI, BUSD, BTCB, UST, ETHER].map((x) => x[ChainId.BSC]),
}
