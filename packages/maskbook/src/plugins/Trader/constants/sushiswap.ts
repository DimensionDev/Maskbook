import { ChainId, ERC20TokenDetailed } from '../../../web3/types'
import { AMPL, SUSHI, DAI, YAM, WBTC, MSKA, MSKB, MSKC, USDC, USDT, WETH, WETH_ONLY, RUNE } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SUSHISWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {
    [ChainId.Mainnet]: {
        [AMPL.address]: [DAI, WETH[ChainId.Mainnet]],
    },
}
export const SUSHISWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [...WETH_ONLY[ChainId.Mainnet], ...[DAI, USDC, USDT, SUSHI, YAM, WBTC, RUNE]],
    [ChainId.Rinkeby]: [...WETH_ONLY[ChainId.Rinkeby], ...[MSKA, MSKB, MSKC]],
}

export const THEGRAPH_SUSHISWAP_FORK = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'

export const SUSHISWAP_INIT_CODE_HASH = '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'
