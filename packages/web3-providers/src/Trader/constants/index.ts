import {
    ChainId,
    AMPL,
    DAI,
    WNATIVE,
    type ERC20AgainstToken,
    WNATIVE_ONLY,
    USDC,
    USDT,
    WBTC,
    OP,
    BTCB,
    BUSD,
    CEUR,
    CUSD,
    NFTX,
    RUNE,
    STETH,
    fUSDT,
    ETHER,
    QUICK,
    maUSDC,
    UST,
    DAIe,
    PNG,
    USDCe,
    USDTe,
    WBTCe,
    WANNA,
    VERSA,
    YUMI,
    xYUMI,
} from '@masknet/web3-shared-evm'
import { ONE } from '@masknet/web3-shared-base'
import { Percent } from '@uniswap/sdk-core'
import type { ERC20TokenCustomizedBase } from '../../types/Trader.js'
import { BigNumber } from 'bignumber.js'

export const UNISWAP_BIPS_BASE = 10000
export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = ONE.dividedBy(BIPS_BASE)

export const DEFAULT_TRANSACTION_DEADLINE = 30 /* minutes */ * 60 /* seconds */
export const L2_TRANSACTION_DEADLINE = 60 /* minutes */ * 5 /* seconds */

export const SLIPPAGE_DEFAULT = 50 // bips

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50, 10000)

const BASE_FEE = new Percent(30, 10000)
export const ZERO_PERCENT = new Percent(0)
export const ONE_HUNDRED_PERCENT = new Percent(1)
export const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

export const MAX_HOP = 3

export const DEFAULT_GAS_LIMIT = 1000000

export const CONSERVATIVE_BLOCK_GAS_LIMIT = 10000000

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

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const SUSHISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const SUSHISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT, WBTC, RUNE, NFTX, STETH].map((x) => x[ChainId.Mainnet]),
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, USDC, USDT, BTCB].map((x) => x[ChainId.BSC]),
    [ChainId.xDai]: [WNATIVE, USDC, USDT, WBTC].map((x) => x[ChainId.xDai]),
    [ChainId.Celo]: [WNATIVE, CUSD, CEUR].map((x) => x[ChainId.Celo]),
    [ChainId.Fantom]: [WNATIVE, DAI, USDC, fUSDT, WBTC].map((x) => x[ChainId.Fantom]),
    [ChainId.Avalanche]: [WNATIVE, DAI, USDC, WBTC, USDT].map((x) => x[ChainId.Avalanche]),
    [ChainId.Optimism]: [WNATIVE, DAI, USDC, WBTC, USDT].map((x) => x[ChainId.Optimism]),
}

export const QUICKSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const QUICKSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Matic]: [WNATIVE, DAI, USDC, USDT, QUICK, ETHER, WBTC, maUSDC].map((x) => x[ChainId.Matic]),
}

export const PANCAKESWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PANCAKESWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.BSC]: [WNATIVE, DAI, BUSD, BTCB, UST, ETHER].map((x) => x[ChainId.BSC]),
}

export const TRADERJOE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const TRADERJOE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Avalanche]: [WNATIVE, DAIe, USDTe, USDCe, WBTCe].map((x) => x[ChainId.Avalanche]),
}

export const PANGOLIN_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PANGOLIN_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Avalanche]: [WNATIVE, DAIe, PNG, USDTe, USDCe, ETHER, WBTCe].map((x) => x[ChainId.Avalanche]),
}

export const WANNASWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const WANNASWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Aurora]: [WNATIVE, WANNA, DAI, USDC, USDT, WBTC].map((x) => x[ChainId.Aurora]),
}

export const TRISOLARIS_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const TRISOLARIS_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Matic]: [WNATIVE, USDC, WBTC, DAI, USDT].map((x) => x[ChainId.Matic]),
    [ChainId.Aurora]: [WNATIVE, DAI, USDT, USDC, WBTC].map((x) => x[ChainId.Aurora]),
}

export const MDEX_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const MDEX_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Mainnet]: [WNATIVE, DAI, USDC, USDT].map((x) => x[ChainId.Mainnet]),
    [ChainId.BSC]: [WNATIVE, DAI, USDC, USDT].map((x) => x[ChainId.BSC]),
}

export const ARTHSWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ARTHSWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT].map((x) => x[ChainId.Astar]),
}

export const VERSA_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const VERSA_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT, BUSD, VERSA].map((x) => x[ChainId.Astar]),
}

export const ASTAREXCHANGE_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const ASTAREXCHANGE_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT].map((x) => x[ChainId.Astar]),
}

export const YUMISWAP_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const YUMISWAP_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Astar]: [WNATIVE, USDC, USDT, YUMI, DAI, xYUMI].map((x) => x[ChainId.Astar]),
}
