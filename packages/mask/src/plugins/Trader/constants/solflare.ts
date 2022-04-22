import { DAI, USDC, USDT, WBTC, FLARE, WNATIVE, WNATIVE_ONLY, ChainId } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SOLFLARE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SOLFLARE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Moonbeam]: [WNATIVE, DAI, FLARE, USDT, USDC, WBTC].map((x) => x[ChainId.Moonbeam]),
}
