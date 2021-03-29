import { ChainId, JSBI, Percent, Token, WETH, INIT_CODE_HASH } from 'quickswap-sdk'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { AMPL, QUICK, DAI, WBTC, USDC, USDT,  WETH_ONLY, WMATIC } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const QUICKSWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: (ERC20TokenDetailed | Token)[]
    }
} = {
    [ChainId.MATIC]: {
        [AMPL.address]: [DAI, WETH[ChainId.MATIC]],
    },
}

export const QUICKSWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.MATIC]: [...WETH_ONLY[ChainId.MATIC], ...[DAI, USDC, USDT, QUICK, WBTC, WMATIC]],
}

export const THEGRAPH_QUICKSWAP = 'https://api.thegraph.com/subgraphs/name/developerfred/quick-swap'

export const QUICKSWAP_INIT_CODE_HASH = INIT_CODE_HASH
