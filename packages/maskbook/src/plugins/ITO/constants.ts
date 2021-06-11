import { ChainId } from '@dimensiondev/web3-shared'

export const ITO_MetaKey = 'com.maskbook.ito:1'
export const ITO_PluginID = 'com.maskbook.ito'

export const ITO_EXCHANGE_RATION_MAX = 6

export const ITO_CONSTANTS = {
    ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0xf110fec3075d7531141b6bf16b11604cb028a17b',
        [ChainId.Ropsten]: '0x37c2f41085ff45f54652c359a7de4deb9d125bf2',
        [ChainId.Rinkeby]: '0x7751b8c715d1Df74D181C86aE01801330211f370',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '0x153466dc03dd36b85c06cb51973a2e81397fca51',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '0x153466dC03DD36b85c06Cb51973a2E81397fcA51',
    },
    MASK_ITO_CONTRACT_ADDRESS: {
        [ChainId.Mainnet]: '0x86812da3A623ab9606976078588b80C315E55FA3',
        [ChainId.Ropsten]: '0x0b0d7efb4a09d818e9dcd609246f10fc6286b8df',
        [ChainId.Rinkeby]: '0x0aC41A27bA9F132D5687CAC986f5302Da6f5F9f6',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    DEFAULT_QUALIFICATION_ADDRESS: {
        [ChainId.Mainnet]: '0x81b6ae377e360dcad63611846a2516f4ba8c88ac',
        [ChainId.Ropsten]: '0x050745919acaa000e5b116b2c499e6f4ed5ce5b6',
        [ChainId.Rinkeby]: '0x88AA0AB3B7cDE263073e1cBa1D06473adeC1b38E',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '0x0061E06c9f640a03C4981f43762d2AE5e03873c5',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '0xe7a945e915E7c17f3263b03ac1bb84fb89410c3a',
    },
    SUBGRAPH_URL: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito-mainnet',
        [ChainId.Ropsten]: 'https://api.thegraph.com/subgraphs/name/dimensiondev/mask-ito',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
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

// for estimate gas
export const FAKE_SIGN_PASSWORD = '0x75466cc969717b172b14253aaeebdc958f2b5037a852c1337650ed4978242dd9'
