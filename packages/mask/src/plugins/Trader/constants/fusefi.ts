import { ChainId, DAI, USDC, USDT, WBTC, ETHER, fUSD, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const FUSEFI_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const FUSEFI_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Fuse]: [WNATIVE, DAI, USDC, USDT, WBTC, ETHER, fUSD].map((x) => x[ChainId.Fuse]),
}
