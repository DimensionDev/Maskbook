import { ChainId } from '@masknet/web3-shared'
import { DAI, ETHER, maUSDC, QUICK, USDC, USDT, WBTC, WETH, WETH_ONLY } from './trader'
import type { AgainstToken, CustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const QUICKSWAP_CUSTOM_BASES: CustomizedBase = {}

export const QUICKSWAP_BASE_AGAINST_TOKENS: AgainstToken = {
    ...WETH_ONLY,
    [ChainId.Matic]: [WETH, DAI, USDC, USDT, QUICK, ETHER, WBTC, maUSDC].map((x) => x[ChainId.Matic]),
}
