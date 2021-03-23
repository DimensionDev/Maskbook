import { ChainId, ERC20TokenDetailed } from '../../../web3/types'
import { AMPL, QUICK, DAI, YAM, WBTC, MSKA, MSKB, MSKC, USDC, USDT, WETH, WETH_ONLY, RUNE } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const QUICKSWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {
    [ChainId.Mainnet]: {
        [AMPL.address]: [DAI, WETH[ChainId.Mainnet]],
    },
}
export const QUICKSWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [...WETH_ONLY[ChainId.Mainnet], ...[DAI, USDC, USDT, QUICK, YAM, WBTC, RUNE]],
    [ChainId.Rinkeby]: [...WETH_ONLY[ChainId.Rinkeby], ...[MSKA, MSKB, MSKC]],
}

export const THEGRAPH_QUICKSWAP = 'https://api.thegraph.com/subgraphs/name/developerfred/quick-swap'

export const QUICKSWAP_INIT_CODE_HASH = '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9'
