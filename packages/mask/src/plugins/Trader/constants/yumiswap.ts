import { ChainId, USDC, USDT, WNATIVE, YUMI, DAI, xYUMI, WNATIVE_ONLY } from '@masknet/web3-shared-evm'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const YUMISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const YUMISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT, YUMI, DAI, xYUMI].map((x) => x[ChainId.Astar]),
}
