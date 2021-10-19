import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, ETHER, maUSDC, QUICK, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const QUICKSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const QUICKSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Matic]: [WNATIVE, DAI, USDC, USDT, QUICK, ETHER, WBTC, maUSDC].map((x) => x[ChainId.Matic]),
}
