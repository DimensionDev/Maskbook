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
        [ChainId.Mainnet]: '0xf110fec3075d7531141b6bf16b11604cb028a17b',
        [ChainId.Ropsten]: '0x37c2f41085ff45f54652c359a7de4deb9d125bf2',
        [ChainId.Rinkeby]: '0x7751b8c715d1Df74D181C86aE01801330211f370',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    MASK_ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0x86812da3A623ab9606976078588b80C315E55FA3',
        [ChainId.Ropsten]: '0x0b0d7efb4a09d818e9dcd609246f10fc6286b8df',
        [ChainId.Rinkeby]: '0x0aC41A27bA9F132D5687CAC986f5302Da6f5F9f6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    DEFAULT_QUALIFICATION_ADDRESS: {
        [ChainId.Mainnet]: '0x989252d4853db438235fbd9c946afc4cca6e21f1',
        [ChainId.Ropsten]: '0xbe3dd217479d93ed76457f01c98296c5235f3054',
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

export const ITO_CONTRACT_BASE_TIMESTAMP = new Date('2021-03-29T00:00:00.000Z').getTime()

export const TIME_WAIT_BLOCKCHAIN = 30000
// Keccak-256(ifQualified(address)) XOR Keccak-256(logQualified(address,uint256))
export const QUALIFICATION_INTERFACE_ID = '0xfb036a85'
// Keccak-256(get_start_time())
export const QUALIFICATION_HAS_START_TIME_INTERFACE_ID = '0xdf29dfc4'
// Keccak-256(isLucky(address))
export const QUALIFICATION_HAS_LUCKY_INTERFACE_ID = '0xadaa0f8a'

export const MSG_DELIMITER = '2c1aca02'
