import { CONSTANTS } from '../../web3/constants'
import { createERC20Token, getConstant } from '../../web3/helpers'
import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 6

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
const HUSD = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'HUSD_ADDRESS', ChainId.Mainnet),
    6,
    'HUSD',
    'HUSD',
)
const BUSD = createERC20Token(
    ChainId.Mainnet,
    getConstant(CONSTANTS, 'BUSD_ADDRESS', ChainId.Mainnet),
    6,
    'Binance USD',
    'BUSD',
)

// Ropsten

const MSKA = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKA_ADDRESS', ChainId.Ropsten),
    18,
    'Mask Token A',
    'MSKA',
)
const MSKB = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKB_ADDRESS', ChainId.Ropsten),
    18,
    'Mask Token B',
    'MSKB',
)
const MSKC = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKC_ADDRESS', ChainId.Ropsten),
    18,
    'Mask Token C',
    'MSKC',
)
const MSKD = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKD_ADDRESS', ChainId.Ropsten),
    18,
    'Mask Token D',
    'MSKD',
)
const MSKE = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKE_ADDRESS', ChainId.Ropsten),
    18,
    'Mask Token E',
    'MSKE',
)

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0x7aEa34bE68171c6898164f3986Db03964CCa49B7',
        [ChainId.Ropsten]: '0xDF0e910DcC73bdC8f4c332A4C12545928683221f',
        [ChainId.Rinkeby]: '0x7751b8c715d1Df74D181C86aE01801330211f370',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    MASK_ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0x86812da3A623ab9606976078588b80C315E55FA3',
        [ChainId.Ropsten]: '0x677f7BbA13108649ECFF068E8B3d55631327B83a',
        [ChainId.Rinkeby]: '0x0aC41A27bA9F132D5687CAC986f5302Da6f5F9f6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    DEFAULT_QUALIFICATION_ADDRESS: {
        [ChainId.Mainnet]: '0x919931df4c9e943612ef565b334791e26dc26b3f',
        [ChainId.Ropsten]: '0x0ac13391f146604a9d32521e536b97b2fe1c5f90',
        [ChainId.Rinkeby]: '0x88AA0AB3B7cDE263073e1cBa1D06473adeC1b38E',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito-mainnet',
        [ChainId.Ropsten]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    EXCHANGE_TOKENS: {
        [ChainId.Mainnet]: [DAI, USDC, USDT, HUSD, BUSD].map((x) => x.address),
        [ChainId.Ropsten]: [MSKA, MSKB, MSKC, MSKD, MSKE].map((x) => x.address),
        [ChainId.Rinkeby]: [],
        [ChainId.Kovan]: [],
        [ChainId.Gorli]: [],
    },
}

export const ITO_CONTRACT_BASE_TIMESTAMP = 1609372800000
export const MASK_ITO_CONTRACT_BASE_TIMESTAMP = 1613088000000

export const TIME_WAIT_BLOCKCHAIN = 30000
