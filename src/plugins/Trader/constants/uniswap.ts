import { Percent, JSBI } from '@uniswap/sdk'
import { ChainId, Token } from '../../../web3/types'
import { CONSTANTS } from '../../../web3/constants'
import { createERC20Token, getConstant } from '../../../web3/helpers'

export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

// Mainnet
const DAI = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'DAI_ADDRESS', ChainId.Mainnet),
    18,
    'Dai Stablecoin',
    'DAI',
)
const USDC = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'USDC_ADDRESS', ChainId.Mainnet),
    6,
    'USD Coin',
    'USDC',
)
const USDT = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'USDT_ADDRESS', ChainId.Mainnet),
    6,
    'Tether USD',
    'USDT',
)
const COMP = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'USDT_ADDRESS', ChainId.Mainnet),
    18,
    'Compound',
    'COMP',
)
const MKR = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'MKR_ADDRESS', ChainId.Mainnet),
    18,
    'Maker',
    'MKR',
)
const AMPL = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'AMPL_ADDRESS', ChainId.Mainnet),
    18,
    'Ampleforth',
    'AMPL',
)

// Rinkeby
const MSKA = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKA_ADDRESS', ChainId.Rinkeby),
    18,
    'Maskbook A',
    'MSKA',
)
const MSKB = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKB_ADDRESS', ChainId.Rinkeby),
    18,
    'Maskbook B',
    'MSKB',
)
const MSKC = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKC_ADDRESS', ChainId.Rinkeby),
    18,
    'Maskbook C',
    'MSKC',
)

export const WETH: {
    readonly [chainId in ChainId]: Token
} = {
    [ChainId.Mainnet]: createERC20Token(
        ChainId.Mainnet,
        getConstant(CONSTANTS, 'WETH_ADDRESS', ChainId.Mainnet),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Ropsten]: createERC20Token(
        ChainId.Ropsten,
        getConstant(CONSTANTS, 'WETH_ADDRESS', ChainId.Ropsten),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Rinkeby]: createERC20Token(
        ChainId.Rinkeby,
        getConstant(CONSTANTS, 'WETH_ADDRESS', ChainId.Rinkeby),
        18,
        'Wrapped Ether',
        'WETH',
    ),
    [ChainId.Kovan]: createERC20Token(
        ChainId.Kovan,
        getConstant(CONSTANTS, 'WETH_ADDRESS', ChainId.Kovan),
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
    [ChainId.Mainnet]: [...WETH_ONLY[ChainId.Mainnet], ...[DAI, USDC, USDT, COMP, MKR, AMPL]],
    [ChainId.Rinkeby]: [...WETH_ONLY[ChainId.Rinkeby], ...[MSKA, MSKB, MSKC]],
}

export const BIPS_BASE = JSBI.BigInt(10000)
export const ONE_BIPS = new Percent(JSBI.BigInt(1), BIPS_BASE)
export const DEFAULT_SLIPPAGE_TOLERANCE = 50 // bips
export const DEFAULT_TRANSACTION_DEADLINE = 20 /* minutes */ * 60 /* seconds */ // seconds
