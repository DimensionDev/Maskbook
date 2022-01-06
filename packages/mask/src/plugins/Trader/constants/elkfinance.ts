import { ChainId } from '@masknet/web3-shared-evm'
import { DAI, USDC, USDT, WBTC, BTCB, BUSD, ETHER, fUSD, fUSDT, WNATIVE, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const ELKFINANCE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ELKFINANCE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Fuse]: [WNATIVE, DAI, USDC, USDT, WBTC, ETHER, fUSD].map((x) => x[ChainId.Fuse]),
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC].map((x) => x[ChainId.Fantom]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC].map((x) => x[ChainId.xDai]),
}
