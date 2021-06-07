import { ChainId, ERC20TokenDetailed } from '@dimensiondev/web3-shared'
import { SUSHI, DAI, YAM, WBTC, MSKA, MSKB, MSKC, USDC, USDT, WETH_ONLY, RUNE } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SUSHISWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {}

export const SUSHISWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [WETH_ONLY, DAI, USDC, USDT, SUSHI, YAM, WBTC, RUNE].map(
        (x) => x[ChainId.Mainnet] as ERC20TokenDetailed,
    ),
    [ChainId.Rinkeby]: [WETH_ONLY, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby] as ERC20TokenDetailed),
}

export const THEGRAPH_SUSHISWAP_FORK = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'

export const SUSHISWAP_INIT_CODE_HASH = '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'
