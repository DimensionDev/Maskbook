import { ChainId, Token } from '../../web3/types'
import { getConstant } from '../../web3/constants'
import { createERC20Token } from './helpers'
import MAINNET_TOKENS from '../../web3/erc20/mainnet.json'
import RINKEBY_TOKENS from '../../web3/erc20/rinkeby.json'
import { Percent, JSBI } from '@uniswap/sdk'

//#region plugin definitions
export const PLUGIN_IDENTIFIER = 'co.maskbook.trader'
export const PLUGIN_METADATA_KEY = 'com.maskbook.trader:1'
//#endregion

//#region apis
export const COIN_GECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

// proxy: https://web-api.coinmarketcap.com/v1
export const CMC_V1_BASE_URL = 'https://coinmarketcap.provide.maskbook.com/v1'

// proxy: https://web-api.coinmarketcap.com/v1.1
export const CMC_V2_BASE_URL = 'https://widgets.coinmarketcap.com/v2'
//#endregion

// the bitcoin ledger started at 03 Jan 2009
export const BTC_FIRST_LEGER_DATE = new Date('2009-01-03T00:00:00.000Z')

//#region settings about trader
export const CRYPTOCURRENCY_MAP_EXPIRES_AT =
    24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */
//#endregion

//#region settings about uniswap
export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

const DAI = createERC20Token(ChainId.Mainnet, getConstant('DAI_ADDRESS', ChainId.Mainnet), 18, 'Dai Stablecoin', 'DAI')
const AMPL = createERC20Token(ChainId.Mainnet, getConstant('AMPL_ADDRESS', ChainId.Mainnet), 18, 'Ampleforth', 'AMPL')

export const WETH: {
    readonly [chainId in ChainId]: Token
} = {
    [ChainId.Mainnet]: createERC20Token(
        ChainId.Mainnet,
        getConstant('WETH_ADDRESS', ChainId.Mainnet),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Ropsten]: createERC20Token(
        ChainId.Ropsten,
        getConstant('WETH_ADDRESS', ChainId.Ropsten),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Rinkeby]: createERC20Token(
        ChainId.Rinkeby,
        getConstant('WETH_ADDRESS', ChainId.Rinkeby),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Kovan]: createERC20Token(
        ChainId.Kovan,
        getConstant('WETH_ADDRESS', ChainId.Kovan),
        18,
        'Wrapped Ether',
        'WETH',
    ),
}

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const CUSTOM_BASES: {
    readonly [chainId in ChainId]?: {
        [tokenAddress: string]: Token[]
    }
} = {
    [ChainId.Mainnet]: {
        [AMPL.address]: [DAI, WETH[ChainId.Mainnet]],
    },
}

const WETH_ONLY: {
    readonly [chainId in ChainId]: Token[]
} = {
    [ChainId.Mainnet]: [WETH[ChainId.Mainnet]],
    [ChainId.Ropsten]: [WETH[ChainId.Ropsten]],
    [ChainId.Rinkeby]: [WETH[ChainId.Rinkeby]],
    [ChainId.Kovan]: [],
}

export const BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: Token[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [
        ...WETH_ONLY[ChainId.Mainnet],
        ...MAINNET_TOKENS.predefined_tokens
            .filter((x) => ['DAI', 'USDC', 'USDT', 'COMP', 'MKR', 'AMPL'].includes(x.symbol))
            .map((x) => createERC20Token(ChainId.Mainnet, x.address, x.decimals, x.name, x.symbol)),
    ],
    [ChainId.Rinkeby]: [
        ...WETH_ONLY[ChainId.Rinkeby],
        ...RINKEBY_TOKENS.predefined_tokens
            .filter((x) => ['KANA', 'KANB'].includes(x.symbol))
            .map((x) => createERC20Token(ChainId.Rinkeby, x.address, x.decimals, x.name, x.symbol)),
    ],
}

export const BIPS_BASE = JSBI.BigInt(10000)
export const ONE_BIPS = new Percent(JSBI.BigInt(1), BIPS_BASE)
export const DEFAULT_SLIPPAGE_TOLERANCE = 50 // bips
export const DEFAULT_TRANSACTION_DEADLINE = 20 /* minutes */ * 60 /* seconds */ // seconds
//#endregion
