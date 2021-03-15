import { INIT_CODE_HASH } from '@uniswap/sdk'
import { ChainId, ERC20TokenDetailed } from '../../../web3/types'
import { AMPL, COMP, DAI, MKR, MSKA, MSKB, MSKC, USDC, USDT, WBTC, WETH, WETH_ONLY } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const UNISWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {
    [ChainId.Mainnet]: {
        [AMPL.address]: [DAI, WETH[ChainId.Mainnet]],
    },
}

export const UNISWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [...WETH_ONLY[ChainId.Mainnet], ...[DAI, USDC, USDT, COMP, MKR, WBTC]],
    [ChainId.Rinkeby]: [...WETH_ONLY[ChainId.Rinkeby], ...[MSKA, MSKB, MSKC]],
}

export const THEGRAPH_UNISWAP_V2 = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

export const UNISWAP_INIT_CODE_HASH = INIT_CODE_HASH

export const MAX_HOP = 3
