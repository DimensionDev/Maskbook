import { ChainId, AMPL, DAI, USDC, USDT, WBTC, WNATIVE, WNATIVE_ONLY, OP } from '@masknet/web3-shared-evm'
import { Percent } from '@uniswap/sdk-core'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from '@masknet/web3-providers/types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const UNISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {
    [ChainId.Mainnet]: {
        [AMPL[ChainId.Mainnet].address]: [DAI, WNATIVE].map((x) => x[ChainId.Mainnet]),
    },
    [ChainId.Matic]: {
        [AMPL[ChainId.Matic].address]: [DAI, WNATIVE].map((x) => x[ChainId.Matic]),
    },
}

export const UNISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Mainnet]),
    [ChainId.Matic]: [WNATIVE, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Matic]),
    [ChainId.Optimism]: [WNATIVE, DAI, USDC, USDT, WBTC, OP].map((x) => x[ChainId.Optimism]),
}

export const MAX_HOP = 3

export const DEFAULT_MULTICALL_GAS_LIMIT = 2000000

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50, 10000)

export const ZERO_PERCENT = new Percent(0)
export const ONE_HUNDRED_PERCENT = new Percent(1)
