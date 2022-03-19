import { ChainId, DAI, MSKA, MSKB, MSKC, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const TRISOLARIS_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const TRISOLARIS_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Rinkeby]: [WNATIVE, MSKA, MSKB, MSKC].map((x) => x[ChainId.Rinkeby]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.Aurora]: [WNATIVE, DAI, USDT, USDC, WBTC].map((x) => x[ChainId.Aurora]),
}
