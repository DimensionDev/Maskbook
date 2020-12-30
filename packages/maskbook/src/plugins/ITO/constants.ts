import { CONSTANTS } from '../../web3/constants'
import { createERC20Token, getConstant } from '../../web3/helpers'
import { ChainId } from '../../web3/types'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 4

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

// Rinkeby

const MSK_A = createERC20Token(
    ChainId.Ropsten,
    getConstant(CONSTANTS, 'MSKA_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask Token A',
    'MSKA',
)
const MSK_B = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKB_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask Token B',
    'MSKB',
)
const MSK_C = createERC20Token(
    ChainId.Rinkeby,
    getConstant(CONSTANTS, 'MSKC_ADDRESS', ChainId.Rinkeby),
    18,
    'Mask Token C',
    'MSKC',
)

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x68fF49cf71c2207EA3D80600e59F00441F753Be8',
        [ChainId.Rinkeby]: '0x2B922CC664b23c5D1A2FA05cd69083c1D91b6c2C',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Ropsten]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Rinkeby]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Kovan]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Gorli]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
    },
    EXCHANGE_TOKENS: {
        [ChainId.Mainnet]: [DAI, USDC, USDT, HUSD, BUSD].map((x) => x.address),
        [ChainId.Ropsten]: [MSKA, MSKB, MSKC].map((x) => x.address),
        [ChainId.Rinkeby]: [MSK_A, MSK_B, MSK_C].map((x) => x.address),
        [ChainId.Kovan]: [],
        [ChainId.Gorli]: [],
    },
}

export const ITO_CONTRACT_BASE_DATE = new Date(2020, 11, 1, 8, 0, 0, 0)
