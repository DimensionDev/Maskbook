import { JSBI, Percent } from '@uniswap/sdk'
import { ChainId, ERC20TokenDetailed } from '../../../web3/types'
import { CONSTANTS } from '../../../web3/constants'
import { createERC20Token, getConstant } from '../../../web3/helpers'

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
    getConstant(CONSTANTS, 'COMP_ADDRESS', ChainId.Mainnet),
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
    readonly [chainId in ChainId]: ERC20TokenDetailed
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
    [ChainId.Gorli]: createERC20Token(
        ChainId.Gorli,
        getConstant(CONSTANTS, 'WETH_ADDRESS', ChainId.Gorli),
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
        [tokenAddress: string]: ERC20TokenDetailed[]
    }
} = {
    [ChainId.Mainnet]: {
        [AMPL.address]: [DAI, WETH[ChainId.Mainnet]],
    },
}

const WETH_ONLY: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    [ChainId.Mainnet]: [WETH[ChainId.Mainnet]],
    [ChainId.Ropsten]: [WETH[ChainId.Ropsten]],
    [ChainId.Rinkeby]: [WETH[ChainId.Rinkeby]],
    [ChainId.Kovan]: [],
    [ChainId.Gorli]: [],
}

export const BASE_AGAINST_TOKENS: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [...WETH_ONLY[ChainId.Mainnet], ...[DAI, USDC, USDT, COMP, MKR]],
    [ChainId.Rinkeby]: [...WETH_ONLY[ChainId.Rinkeby], ...[MSKA, MSKB, MSKC]],
}

export const UNISWAP_BIPS_BASE = JSBI.BigInt(10000)
export const UNISWAP_ONE_BIPS = new Percent(JSBI.BigInt(1), UNISWAP_BIPS_BASE)

export const UNISWAP_DEFAULT_TRANSACTION_DEADLINE = 20 /* minutes */ * 60 /* seconds */ // seconds

export const UNISWAP_PRICE_IMPACT_LOW = 100 // 1%
export const UNISWAP_PRICE_IMPACT_MEDIUM = 300 // 3%
export const UNISWAP_PRICE_IMPACT_HIGH = 500 // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const UNISWAP_PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = 1000 // 10%
// for non expert mode disable swaps above this
export const UNISWAP_PRICE_IMPACT_NON_EXPERT_BLOCKED = 1500 // 15%
