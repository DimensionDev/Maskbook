import BigNumber from 'bignumber.js'
import { CONSTANTS } from '../../../web3/constants'
import { createERC20Token, getConstant } from '../../../web3/helpers'
import { ChainId, ERC20TokenDetailed } from '../../../web3/types'

export const TRADE_CONSTANTS = {
    UNISWAP_V2_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Ropsten]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Rinkeby]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Kovan]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Gorli]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
    UNISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Ropsten]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Rinkeby]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Kovan]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Gorli]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    },
    SUSHISWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Ropsten]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Rinkeby]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Kovan]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Gorli]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    },
    SUSHISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    SASHIMISWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: ' 0x31db862df7be09718a860c46ab17ca57966e69ed',
        [ChainId.Ropsten]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Rinkeby]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Kovan]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Gorli]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
    },
    SASHIMISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0xF028F723ED1D0fE01cC59973C49298AA95c57472',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    BALANCER_ETH_ADDRESS: {
        [ChainId.Mainnet]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Ropsten]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Rinkeby]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Kovan]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Gorli]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    },
    BALANCER_EXCHANGE_PROXY_ADDRESS: {
        [ChainId.Mainnet]: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec',
        [ChainId.Gorli]: '',
    },
    BALANCER_POOLS_URL: {
        [ChainId.Mainnet]: 'https://ipfs.fleek.co/ipns/balancer-bucket.storage.fleek.co/balancer-exchange/pools',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]:
            'https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange-kovan/pools',
        [ChainId.Gorli]: '',
    },
}

// WETH
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

export const WETH_ONLY: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    [ChainId.Mainnet]: [WETH[ChainId.Mainnet]],
    [ChainId.Ropsten]: [WETH[ChainId.Ropsten]],
    [ChainId.Rinkeby]: [WETH[ChainId.Rinkeby]],
    [ChainId.Kovan]: [],
    [ChainId.Gorli]: [],
}

// Mainnet
export const DAI = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'DAI_ADDRESS', ChainId.Mainnet),
    18,
    'Dai Stablecoin',
    'DAI',
)
export const USDC = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'USDC_ADDRESS', ChainId.Mainnet),
    6,
    'USD Coin',
    'USDC',
)
export const USDT = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'USDT_ADDRESS', ChainId.Mainnet),
    6,
    'Tether USD',
    'USDT',
)
export const COMP = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'COMP_ADDRESS', ChainId.Mainnet),
    18,
    'Compound',
    'COMP',
)
export const MKR = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'MKR_ADDRESS', ChainId.Mainnet),
    18,
    'Maker',
    'MKR',
)
export const AMPL = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'AMPL_ADDRESS', ChainId.Mainnet),
    18,
    'Ampleforth',
    'AMPL',
)
export const UST = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'UST_ADDRESS'),
    18,
    'Wrapped UST Token',
    'UST',
)
export const SUSHI = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'SUSHI_ADDRESS'),
    18,
    'SushiToken',
    'SUSHI',
)
export const YAM = createERC20Token(ChainId.Mainnet, getConstant(CONSTANTS, 'YAM_ADDRESS'), 18, 'YAM', 'YAM')
export const WBTC = createERC20Token(ChainId.Mainnet, getConstant(CONSTANTS, 'WBTC_ADDRESS'), 18, 'Wrapped BTC', 'WBTC')
export const RUNE = createERC20Token(ChainId.Mainnet, getConstant(CONSTANTS, 'RUNE_ADDRESS'), 18, 'RUNE.ETH', 'RUNE')
export const YFI = createERC20Token(ChainId.Mainnet, getConstant(CONSTANTS, 'YFI_ADDRESS'), 18, 'Yearn', 'YFI')

// Rinkeby
export const MSKA = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKA_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask A',
    'MSKA',
)
export const MSKB = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKB_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask B',
    'MSKB',
)
export const MSKC = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKC_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask C',
    'MSKC',
)

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = new BigNumber(1).dividedBy(BIPS_BASE)

export const SLIPPAGE_TOLERANCE_MIN = 10 // bips
export const SLIPPAGE_TOLERANCE_DEFAULT = 50 // bips
export const SLIPPAGE_TOLERANCE_MAX = 500 // bips

export const DEFAULT_TRANSACTION_DEADLINE = 20 /* minutes */ * 60 /* seconds */

export const PRICE_IMPACT_LOW = 100 // 1%
export const PRICE_IMPACT_MEDIUM = 300 // 3%
export const PRICE_IMPACT_HIGH = 500 // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = 1000 // 10%
// for non expert mode disable swaps above this
export const PRICE_IMPACT_NON_EXPERT_BLOCKED = 1500 // 15%
