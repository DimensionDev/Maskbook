import { ChainId, ERC20TokenDetailed } from '@masknet/web3-shared'
import { WETH_ONLY, WETH, DAI, USDC, USDT, QUICK, ETHER, WBTC, maUSDC } from './trader'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const QUICKSWAP_CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {}

export const QUICKSWAP_BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Matic]: [WETH, DAI, USDC, USDT, QUICK, ETHER, WBTC, maUSDC].map((x) => x[ChainId.Matic]),
}
