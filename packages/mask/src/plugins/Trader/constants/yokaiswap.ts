import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, ETHER, YOK, USDC, USDT, BUSD, WBTC, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const YOKAISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const YOKAISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Nervos]: [WNATIVE, YOK, DAI, USDT, USDC, ETHER, WBTC, BUSD].map((x) => x[ChainId.Nervos]),
}
