import { ChainId, ERC20TokenDetailed } from '@masknet/web3-shared'
import { SUSHI, DAI, YAM, WBTC, MSKA, MSKB, MSKC, USDC, USDT, WETH, WETH_ONLY, RUNE } from './trader'

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
    [ChainId.Mainnet]: [WETH, DAI, USDC, USDT, SUSHI, YAM, WBTC, RUNE].map((x) => x[ChainId.Mainnet]),
    [ChainId.Rinkeby]: [WETH, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby]),
}
