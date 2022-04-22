import { DAI, USDC, USDT, WBTC, ZLK, WNATIVE, WNATIVE_ONLY, ChainId } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const ZENLINK_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ZENLINK_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Moonbeam]: [WNATIVE, DAI, ZLK, USDT, USDC, WBTC].map((x) => x[ChainId.Moonbeam]),
}
