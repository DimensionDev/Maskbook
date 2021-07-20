import JSBI from 'jsbi'
import { ChainId, ERC20TokenDetailed } from '@masknet/web3-shared'
import { Percent } from '@uniswap/sdk-core'
import { INIT_CODE_HASH } from '@uniswap/v2-sdk'
import { AMPL, DAI, MSKA, MSKB, MSKC, USDC, USDT, WBTC, WETH, WETH_ONLY } from './trader'

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
        [AMPL[ChainId.Mainnet].address]: [DAI, WETH].map((x) => x[ChainId.Mainnet]),
    },
}

export const UNISWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [WETH, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Mainnet]),
    [ChainId.Rinkeby]: [WETH, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby]),
}

export const THEGRAPH_UNISWAP_V2 = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

export const UNISWAP_INIT_CODE_HASH = INIT_CODE_HASH

export const MAX_HOP = 3

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
