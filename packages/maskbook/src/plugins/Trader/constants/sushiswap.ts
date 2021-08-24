import { ChainId } from '@masknet/web3-shared'
import { DAI, MSKA, MSKB, MSKC, RUNE, USDC, USDT, WBTC, WETH, WETH_ONLY, NFTX, STETH, BUSD, BTCB } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SUSHISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SUSHISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [WETH, DAI, USDC, USDT, WBTC, RUNE, NFTX, STETH].map((x) => x[ChainId.Mainnet]),
    [ChainId.Rinkeby]: [WETH, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby]),
    [ChainId.Matic]: [WETH, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WETH, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
}
